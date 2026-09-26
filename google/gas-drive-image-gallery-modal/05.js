<script>
(() => {
  /* ------------------------------------------------------------------
   * 1. 定数・キャッシュ
   * ------------------------------------------------------------------*/
  const PER_PAGE      = 18;

  // jQuery オブジェクトのキャッシュ
  const $grid   = $('#grid');           // 画像グリッド
  const $pager  = $('#pagenation');     // ページャ
  const $filter = $('#filter');
  const $chara  = $('#select_chara');
  const $tags   = $('#select_tag');
  const $modal  = $('.iziModal');

  /* ------------------------------------------------------------------
   * 2. 状態変数
   * ------------------------------------------------------------------*/
  let allData   = [];   // スプレッドシート全件
  let listData  = [];   // 画像あり・有効フラグ付きデータ
  let filterKeys = ["rare", "type"];
  let chunks    = [];   // ページング用
  let selFilter = [], selChara = [], selTags = [];

  /* ------------------------------------------------------------------
   * 3. 初期化
   * ------------------------------------------------------------------*/
  $(async () => {
    $('#btn-search').on('click', onSearchClick);

    initModal();
    await loadSheetData();
    buildUI();
  });

  /* ------------------------------------------------------------------
   * 4. モーダル初期化
   * ------------------------------------------------------------------*/
  function initModal () {
    const $modal = $('.iziModal');
    const $grid  = $('#grid');

    $modal.iziModal({
      maxWidth : 0,        // 0 = 制限なし（プラグイン推奨値）
      maxHeight: '90%',    // 高さは 90% に制限
      width    : null,     // 自動
      transitionIn: 'fadeIn',
      onClosed   : () => $modal.iziModal('setContent', '')
    });

    $grid.on('click', 'img.card', function () {
      const full = $(this).data('full');
      const alt  = this.alt;
      const $modal = $('.iziModal');

      const img = new Image();
      img.onload = function () {
        const html = `<img src="${full}" alt="${alt}" class="modal_card">`;
        $modal.iziModal('setContent', html);
        $modal.iziModal('open');
      };
      img.src = full;
    });

  }

  /* ------------------------------------------------------------------
   * 5. データ取得
   * ------------------------------------------------------------------*/
    async function loadSheetData () {
      const json = await new Promise(resolve => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(() => alert('データ取得失敗'))
          .getSSValues();
      });

      allData = JSON.parse(json);

      listData = allData.filter(d =>
        getThumb(d) && d.item_name
      );
    }

  /* ------------------------------------------------------------------
   * 6. UI 構築
   * ------------------------------------------------------------------*/
  async function buildUI () {
    /* プルダウン ---------------- */
    const charaSet = uniqCompact(propArray(allData, 'item_name'));
    populateSelect($chara, charaSet);

    /* タグプルダウン ------------------ */
    const tagSet = uniqCompact(
      flatMap(listData, d => splitCSV(d.tag))
    );
    populateSelect($tags, tagSet);

    /* 絞り込みキー -------------------- */
    refreshFilterSelect();

    /* 一覧 & ページング --------------- */
    listData = _.sortBy(listData, d => -d.id);
    renderPage(listData);
  }

  /* ------------------------------------------------------------------
   * 7. 検索処理
   * ------------------------------------------------------------------*/
  function onSearchClick () {
    selFilter = $filter.val() || [];
    selChara  = $chara.val()  || [];
    selTags   = $tags.val()   || [];

    const filtered = listData
      .filter(d => !selChara.length || selChara.includes(d.item_name))
      .filter(d => filterRow(d, selFilter))
      .filter(d => tagMatch(d.tag, selTags));

    renderPage(filtered);
  }

  function filterRow (row, selected) {
    if (!selected.length) return true;

    return filterKeys.every(key => {
      const keyOpts = getColumnValues(key);
      const hit     = _.intersection(selected, keyOpts);
      if (!hit.length) return true;

      const rowVals = splitCSV(row[key]);
      return !rowVals.length || rowVals.some(v => hit.includes(v));
    });
  }

  function tagMatch (tagStr, selected) {
    if (!selected.length) return true;
    const tagArr = splitCSV(tagStr);
    return tagArr.some(t => selected.includes(t));
  }

  /* ------------------------------------------------------------------
   * 8. 描画関連
   * ------------------------------------------------------------------*/
  function renderPage (data) {
    const firstPage = setupPagination(data);
    renderGrid(firstPage);
  }

  function renderGrid(data) {
    $grid.empty();

    data.forEach(d => {
      const $li = $('<li>', {
        class: 'list_item',
        name : d.file_name,
        alt  : d.item_name,
        'data-id': d.id,
        'data-name': d.file_name,
        'data-alt': d.item_name
      });

      const thumb = getThumb(d); 
      const full  = getFull(d);

      if (!thumb) return;

      $('<img>', {
        class : 'card',
        src   : thumb,
        'data-full': full,
        alt   : d.file_name,
        loading : 'lazy'
      }).appendTo($li);

      $grid.append($li);
    });
  }

  function setupPagination (data) {
    if ($pager.data('twbs-pagination')) $pager.twbsPagination('destroy');

    if (data.length <= PER_PAGE) {
      $pager.hide();
      return data;
    }

    chunks = _.chunk(data, PER_PAGE);
    $pager.twbsPagination({
      totalPages  : chunks.length,
      visiblePages: 5,
      onPageClick : (_, page) => renderGrid(chunks[page-1])
    });
    $pager.show();
    return chunks[0];
  }

  /* ------------------------------------------------------------------
   * 9. フィルターセレクト生成
   * ------------------------------------------------------------------*/
  async function getFilterHeader () {
    const json = await new Promise(resolve => {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(() => alert('フィルターキー取得失敗'))
        .getFilterKeys();
    });
    return JSON.parse(json);
  }

  function refreshFilterSelect () {
    $filter.empty();
    filterKeys.forEach(key => {
      const opts = getColumnValues(key);
      const $group = $('<optgroup>', { label: key });
      opts.forEach(v => $('<option>', { value:v, text:v }).appendTo($group));
      $group.appendTo($filter);
    });
    $filter.selectpicker('refresh');
  }

  /* ------------------------------------------------------------------
   * 10. ユーティリティ
   * ------------------------------------------------------------------*/
  const flatMap     = (arr, fn) => [].concat(...arr.map(fn));   // lodash 代替
  const uniqCompact = arr => _.uniq(arr.filter(Boolean));       // 空文字除外＋重複排除
  const propArray   = (arr, key) => arr.map(o => o[key]);       // プロパティ抽出
  const toBool = v => String(v).toLowerCase() === 'true';
  const splitCSV = str => (str ? str.split(',') : []);
  const getThumb = d => d.image_path ? `${d.image_path}&sz=w400` : '';
  const getFull  = d => d.image_path ? `${d.image_path}&sz=w1920` : '';

  function populateSelect ($sel, items) {
    $sel.empty();
    items.forEach(v => $('<option>', { value:v, text:v }).appendTo($sel));
    $sel.selectpicker('refresh');
  }

  function getColumnValues (key) {
    return uniqCompact(
      flatMap(listData, d => splitCSV(d[key]))
    );
  }

})();
</script>

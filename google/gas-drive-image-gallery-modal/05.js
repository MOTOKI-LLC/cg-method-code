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
  let allData   = [];   // 管理シートの7列（最大500件）
  let listData  = [];   // 画像URLとアイテム名のあるデータ
  let filterKeys = ["rare", "type"];
  let chunks    = [];   // ページング用
  let selFilter = [], selChara = [], selTags = [];

  /* ------------------------------------------------------------------
   * 3. 初期化
   * ------------------------------------------------------------------*/
  $(async () => {
    $('#btn-search').on('click', onSearchClick);

    try { initModal(); await loadSheetData(); await buildUI(); }
    catch (_) { $grid.empty().append($('<li>').text('初期化に失敗しました。ライブラリの読込み、シートの設定、実行権限を確認してください。')); }
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
        const html = $('<img>', {src: full, alt: alt, class: 'modal_card'})[0].outerHTML;
        $modal.iziModal('setContent', html);
        $modal.iziModal('open');
      };
      img.onerror = () => alert('画像を取得できません。閲覧権限とログイン状態を確認してください。');
      img.src = full;
    });

  }

  /* ------------------------------------------------------------------
   * 5. データ取得
   * ------------------------------------------------------------------*/
    async function loadSheetData () {
      const json = await new Promise((resolve, reject) => {
        google.script.run
          .withSuccessHandler(resolve)
          .withFailureHandler(reject)
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
      const hit = keyOpts.filter(value => selected.includes(JSON.stringify([key, value])));
      if (!hit.length) return true;

      const rowVals = splitCSV(row[key]);
      return rowVals.some(v => hit.includes(v));
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
    if (!data.length) {
      $('<li>').text('一致する画像がありません。条件を解除するか、管理シートの画像URLとアイテム名を確認してください。').appendTo($grid);
      return;
    }

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

  function refreshFilterSelect () {
    $filter.empty();
    filterKeys.forEach(key => {
      const opts = getColumnValues(key);
      const $group = $('<optgroup>', { label: key });
      opts.forEach(v => $('<option>', { value: JSON.stringify([key, v]), text:v }).appendTo($group));
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
  const splitCSV = str => String(str || '').split(',').map(v => v.trim()).filter(Boolean);
  function imageUrl(d, size) {
    try {
      const url = new URL(d.image_path);
      if (url.origin !== 'https://drive.google.com' || url.pathname !== '/thumbnail') return '';
      if (!/^[A-Za-z0-9_-]+$/.test(url.searchParams.get('id') || '')) return '';
      const clean = new URL('https://drive.google.com/thumbnail');
      clean.searchParams.set('id', url.searchParams.get('id'));
      clean.searchParams.set('sz', size);
      return clean.href;
    } catch (_) { return ''; }
  }
  const getThumb = d => imageUrl(d, 'w400');
  const getFull = d => imageUrl(d, 'w1920');

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

<script>
  let conversation = [];
  let conversationId = Date.now().toString();

  const chatLog = document.getElementById("chatLog");
  const input = document.getElementById("inputText");
  const historyList = document.getElementById("historyList");

  function startNewConversation() {
    conversation = [];
    conversationId = Date.now().toString();
    chatLog.innerHTML = "";
    input.value = "";
    loadSidebar();
  }

  function appendMessage(role, content) {
    const div = document.createElement("div");
    div.className = `message ${role}`;
    div.innerHTML = `${role === 'user' ? 'あなた' : 'AI'}: ${content}`;
    chatLog.appendChild(div);
  }

  function groupByThread(data) {
    const grouped = {};
    data.forEach(item => {
      if (!grouped[item.thread]) grouped[item.thread] = [];
      grouped[item.thread].push(item);
    });
    return grouped;
  }

  function loadSidebar() {
    google.script.run
      .withSuccessHandler(function(data) {
        historyList.innerHTML = "";
        if (!Array.isArray(data) || data.length === 0) {
          historyList.textContent = "履歴がありません";
          return;
        }

        const grouped = groupByThread(data);
        Object.entries(grouped).reverse().forEach(([threadId, messages]) => {
          const div = document.createElement("div");
          div.className = "history-item";
          div.textContent = messages[0].user;
          div.onclick = () => loadHistoryFromThread(messages);
          historyList.appendChild(div);
        });
      })
      .withFailureHandler(err => {
        console.error("履歴取得に失敗:", err);
        alert("履歴の読み込みに失敗しました。");
      })
      .getHistoryFromSheetWithThreads();
  }

  function loadHistoryFromThread(messages) {
    conversation = [];
    conversationId = messages[0].thread;
    chatLog.innerHTML = "";

    messages.forEach(msg => {
      conversation.push({ role: 'user', content: msg.user });
      appendMessage('user', msg.user);
      conversation.push({ role: 'assistant', content: msg.bot });
      appendMessage('bot', msg.bot);
    });
  }

  function sendMessage() {
    const userMsg = input.value.trim();
    if (!userMsg) return;

    appendMessage('user', userMsg);
    input.value = "";

    conversation.push({ role: 'user', content: userMsg });

    const modelSelect = document.getElementById("modelSelect");
    const selectedModel = modelSelect.value;

    google.script.run
      .withSuccessHandler(function(response) {
        appendMessage('bot', response);
        conversation.push({ role: 'assistant', content: response });
        loadSidebar();
      })
      .askChatGPTWithModel(userMsg, conversationId, selectedModel);
  }

  window.onload = loadSidebar;
</script>

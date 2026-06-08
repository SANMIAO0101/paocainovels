/* 泡菜小说坊：基础防复制。注意：前端代码只能降低普通复制，不能阻止技术爬取。 */
(function () {
  function warn() {
    alert("本站内容仅供学习阅读，请勿复制转载。");
  }

  document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
  });

  document.addEventListener("copy", function (event) {
    event.preventDefault();
    warn();
  });

  document.addEventListener("cut", function (event) {
    event.preventDefault();
  });

  document.addEventListener("dragstart", function (event) {
    event.preventDefault();
  });

  document.addEventListener("keydown", function (event) {
    const key = String(event.key || "").toLowerCase();

    if (
      event.key === "F12" ||
      (event.ctrlKey && key === "u") ||
      (event.ctrlKey && key === "s") ||
      (event.ctrlKey && key === "c") ||
      (event.ctrlKey && key === "a") ||
      (event.ctrlKey && event.shiftKey && key === "i") ||
      (event.ctrlKey && event.shiftKey && key === "j")
    ) {
      event.preventDefault();
      warn();
    }
  });
})();

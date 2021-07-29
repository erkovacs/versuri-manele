(function(document, window) {
  const app = {};
  app.TIMEOUT = 5000;
  app.appElement = document.getElementById("app");
  app._range = (a, b) => {
    const ret = [];
    for (let i = a; i < b; i++) {
      ret.push(i);
    }
    return ret;
  };
  app.init = async () => {
    const order = document.getElementById("order");
    app
      ._range(1, 26)
      .map(i =>
        order.insertAdjacentHTML(
          "beforeend",
          `<option value="${i}">${i}</option>`
        )
      );

      const artistsCtrl = document.getElementById("artists");
      const response = await fetch('/api/artists');
      const artists = await response.json();
      for (let artist in artists.data) {
        if (!artist) continue;
        artistsCtrl.insertAdjacentHTML(
          "beforeend",
          `&nbsp;<label for="artists">${artist}</label><input type="checkbox" name="artists" value="${artist}"/>&nbsp;`
        );
      }
  };
  app.error = msg => {
    const template = `<div class="col-md-12 alert alert-dismissible alert-danger" id="__alert">
      <button type="button" class="close" id="__alertDismiss">&times;</button>
      ${msg}.
    </div>`;
    const dismiss = () => {
      const ctx = document.getElementById("__alert");
      ctx.parentNode.removeChild(ctx);
    };
    app.appElement.insertAdjacentHTML("afterBegin", template);
    document
      .getElementById("__alertDismiss")
      .addEventListener("click", dismiss);
    setTimeout(dismiss, app.TIMEOUT);
  };
  app.handleSubmit = async url => {
    const artists = document.getElementById("artists");
    const order = document.getElementById("order");
    const length = document.getElementById("length");
    const output = document.getElementById("output");

    const request = {
      artists: [...artists.options]
        .filter(a => a.selected)
        .map(a => a.value),
      order: order.value,
      length: length.value
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      });
      const json = await res.json();
      if (json.success) {
        output.value = json.data;
      } else {
        app.error(json.error);
      }
    } catch (err) {
      app.error(err.toString());
      console.error(err);
    }
  };

  const form = document.getElementById("generateText");
  form.addEventListener("submit", e => {
    e.preventDefault();
    app.handleSubmit(form.action);
  });

  window.addEventListener("load", () => {
    app.init();
  });
})(document, window);

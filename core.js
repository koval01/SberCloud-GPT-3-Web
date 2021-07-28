function deleteAllCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}
function display_hint() {
  let hint = $("#prompt_select_story");
  hint.css({"display": "inline-block", "margin-top": "0"});
}
function select_story(el) {
  let jthis = jQuery(el);
  let text = jthis.find("blockquote").text();
  $("textarea").val(text);
  window.scrollTo({top: 0, behavior: 'smooth'});
}
function format_result(server_response) {
  let text = server_response.predictions;
  let html_result = `<figure class="border-bottom" onclick="select_story(this)"><blockquote class="blockquote"><b>${text}</b></blockquote><figcaption class="blockquote-footer">SberCloud</figcaption></figure>`;
  return html_result;
}
function generate_continue() {
    const url = "https://api.aicloud.sbercloud.ru/public/v1/public_inference/gpt3/predict";
    const button = $("#generate_continue_button"),
        loader = button.find("span");
    var txt_c = $("textarea").val();
  
    deleteAllCookies();

    if (!txt_c.length) {
      txt_c = "Вчера я";
      $("textarea").val(txt_c);
    }

    $.ajax({
      url: url,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        text: txt_c,
      }),
      beforeSend: function () {
        loader.css("display", "inline-block");
        button.prop('disabled', true);
      },
      success: function (o) {
        display_hint();
          
        let block = $("#result_continue_block");
          
        loader.css("display", "none");
        button.prop('disabled', false);
        block.prepend(format_result(o));
          
        document.getElementById('result_continue_block').scrollIntoView({
          behavior: 'smooth'
        });
      },
      error: function () {
        loader.css("display", "none");
        button.prop('disabled', false);
        alert("Извините, но произошла ошибка...");
      },
    });
}

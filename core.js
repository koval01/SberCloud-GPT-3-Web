const notify_config = {
  autoHideDelay: 3000,
  autoHide: true,
  globalPosition: 'bottom right',
  clickToHide: true,
  className: 'info',
 };

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

function clear_text_area() {
  $("textarea").val("");
  edit_query_string("");
  $.notify('Поле очищено!', notify_config);
}

function copyToClipboard(text) {
  var input = document.body.appendChild(document.createElement("input"));
  input.value = text;
  input.focus();
  input.select();
  document.execCommand('copy');
  input.parentNode.removeChild(input);
}

function copy_share_link() {
  copyToClipboard(window.location.href);
  $.notify('Ссылка скопирована!', notify_config);
}

function select_story(el) {
  let jthis = jQuery(el);
  let text = jthis.find("blockquote").text();
  $("textarea").val(text.replace("<br/>", "\n"));
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function clear_feed_() {
  $("#result_continue_block").empty();
  window.scrollTo({top: 0, behavior: 'smooth'});
  $.notify('Записи удалены!', notify_config);
}

/* copied from awse.us code */

function edit_query_string(data, name="start") {
  var queryParams = new URLSearchParams(window.location.search);
  queryParams.set(name, data);
  history.replaceState(null, null, "?" + queryParams.toString());
}

function getParameterByName(name, url = window.location.href) {
  try {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  } catch {
      alert("Ошибка парсинга адресной строки.");
  }
}

/* finish awse.us code 👨‍💻 */

function format_result(server_response) {
  let text = (server_response.predictions).replace("\n", "<br/>");
  let html_result = `<figure class="border-bottom" onclick="select_story(this)"><blockquote class="blockquote"><b>${text}</b></blockquote><figcaption class="blockquote-footer">SberCloud</figcaption></figure>`;
  return html_result;
}

function generate_continue() {
  const url = "https://api.aicloud.sbercloud.ru/public/v1/public_inference/gpt3/predict";
  const button = $("#generate_continue_button"),
      loader = button.find("span");
  const clear_button = $("#clear_text_area");
  
  let text_area = $("textarea");
  let txt_c = text_area.val();
  
  deleteAllCookies();

  if (!txt_c.length) {
    txt_c = "Вчера был прекрасный день"; // example text
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
      text_area.prop("disabled", true);
      clear_button.prop("disabled", true);
    },
    success: function (o) {
      display_hint();
          
      let block = $("#result_continue_block");
          
      loader.css("display", "none");
      button.prop('disabled', false);
      text_area.prop('disabled', false);
      clear_button.prop("disabled", false);
      
      block.prepend(format_result(o));
          
      document.getElementById('result_continue_block').scrollIntoView({
        behavior: 'smooth'
      });
    },
    error: function () {
      loader.css("display", "none"); 
      
      button.prop('disabled', false);
      text_area.prop('disabled', false);
      clear_button.prop("disabled", false);
      
      alert("Извините, но произошла ошибка...");
    },
  });
}

$('textarea').on('input', function() {
  let text = $("textarea").val();
  edit_query_string(text);
});

function tick_init_() {
  setInterval(function() {
    let clear_feed_button = $("#clear_feed_");
    let clear_textarea_button = $("#clear_text_area");
    
    let textarea_value = $("textarea").val();
    let feed_elements_num = $("#result_continue_block").length;
    
    var textarea_bool = false, feed_bool = false;
    
    if (!feed_elements_num) {
      feed_bool = true;
    }
    if (!textarea_value) {
      textarea_bool = true;
    }
    
    clear_feed_button.prop('disabled', feed_bool);
    clear_textarea_button.prop('disabled', textarea_bool);
  }, 100);
}

$(document).ready(function() {
  let start_text = getParameterByName('start');
  
  if(start_text) {
    $("textarea").val(start_text);
    generate_continue();
  }
  
  tick_init_();
});

console.log("/// inject.js running");

function changewithbidding() {
  console.log("bid container changed");
}

const $bid_container = $(".app-container-main-view_content")

$(document).ready(function(){
 console.log("/// document ready");

 $bid_container.bind("DOMSubtreeModified", changewithbidding);
})

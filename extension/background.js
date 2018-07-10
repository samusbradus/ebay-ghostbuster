// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([{
      // That fires when a page's URL contains this text ...
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            urlContains: 'https://www.ebay.co.uk/bfl/viewbids/'
          },
        })
      ],
      // And shows the extension's page action.
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

console.log("running");

/*chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.cmd) {
      case 'get-brand-print-button-markup':
        getBrandPrintButtonMarkup(request, sendResponse);
        break;
      case 'get-client-print-button-markup':
        getClientPrintButtonMarkup(request, sendResponse);
        break;
      case 'get-standard-print-iframe-content':
        getStandardPrintIframeContent(request, sendResponse);
        break;
      case 'get-brand-print-iframe-content':
        getBrandPrintIframeContent(request, sendResponse);
        break;
      case 'get-client-print-iframe-content':
        getClientPrintIframeContent(request, sendResponse);
        break;
    }

    return true;
  }
);

function getLocalFile(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            callback(xhr.responseText);
        }
    };
    xhr.send();
}

function getClientPrintButtonMarkup(request, sendResponse) {
    const client_name = request.client_name;

    getLocalFile(chrome.runtime.getURL("templates/client-mappings.json"), function(response) {
        const mappings = JSON.parse(response);

        if (mappings.hasOwnProperty(client_name)) {
            const client_settings = mappings[client_name];

            if (client_settings.hasOwnProperty("_extra_button_link_html")) {
                getLocalFile(chrome.runtime.getURL("templates/clients/" + client_settings["_directory"] + "/" + client_settings["_extra_button_link_html"]), function(button_html) {
                    sendResponse({
                        content: button_html,
                        custom: true
                    });
                });
            } else {
                sendResponse({
                    custom: false
                });
            }
        } else {
            sendResponse({
                custom: false
            });
        }
    });
}

function getBrandPrintButtonMarkup(request, sendResponse) {
    const brand = request.brand;

    getLocalFile(chrome.runtime.getURL("templates/brand-mappings.json"), function(response) {
        const mappings = JSON.parse(response);

        if (mappings.hasOwnProperty(brand)) {
            const brand_settings = mappings[brand];

            if (brand_settings.hasOwnProperty("_extra_button_link_html")) {
                getLocalFile(chrome.runtime.getURL("templates/brands/" + brand_settings["_directory"] + "/" + brand_settings["_extra_button_link_html"]), function(button_html) {
                    sendResponse({
                        content: button_html,
                        custom: true
                    });
                });
            } else {
                sendResponse({
                    custom: false
                });
            }
        } else {
            sendResponse({
                custom: false
            });
        }
    });
}

function getStandardPrintIframeContent(request, sendResponse) {
    getLocalFile(chrome.runtime.getURL("templates/print.html"), function(content) {
        content = content.replace('__PRINT_CSS_URL__', chrome.runtime.getURL('templates/print.css'));

        getLocalFile(chrome.runtime.getURL("templates/client-mappings.json"), function(response) {
            const mappings = JSON.parse(response);
            const icon_url_root = "templates/clients";
            let icon_url_subdirectory = "djhenry";
            let icon_url_contract_icon = "djhenry_generic.png";
            let icon_url_path = icon_url_root + "/" + icon_url_subdirectory + "/" + icon_url_contract_icon;

            const client_name = request.client_name;
            const contract_name = request.contract_name;

            console.log("Looking for data for client: " + client_name + " and contract: " + contract_name);

            if (mappings.hasOwnProperty(client_name)) {
                console.log("Found client_name: " + client_name);
                const client_data = mappings[client_name];

                icon_url_subdirectory = client_data["_directory"];

                if (client_data.hasOwnProperty(contract_name)) {
                    console.log("Found contract_name: " + contract_name);
                    icon_url_contract_icon = client_data[contract_name];
                    icon_url_path = icon_url_root + "/" + icon_url_subdirectory + "/" + icon_url_contract_icon;
                } else if (client_data.hasOwnProperty("_default_icon")) {
                    console.log("Found _default_icon: " + client_data["_default_icon"]);
                    icon_url_path = icon_url_root + "/" + icon_url_subdirectory + "/" + client_data["_default_icon"];
                } else {
                    console.log("Found neither contract_name nor _default_icon");
                }
            }

            console.log("Looking up URL: " + icon_url_path);

            content = content.replace('__ICON_URL__', chrome.runtime.getURL(icon_url_path));

            sendResponse({
                content: content
            });
        });
    });
}

function getClientPrintIframeContent(request, sendResponse) {
    const client_name = request.client_name;
    console.log("Custom: Client is: " + client_name);

    getLocalFile(chrome.runtime.getURL("templates/client-mappings.json"), function(response) {
        const mappings = JSON.parse(response);

        if (mappings.hasOwnProperty(client_name)) {
            let client_settings;

            if (mappings.hasOwnProperty(client_name)) {
                client_settings = mappings[client_name];
            }

            if (client_settings.hasOwnProperty("_extra_button_template_html")) {
                getLocalFile(chrome.runtime.getURL("templates/clients/" + client_settings["_directory"] + "/" + client_settings["_extra_button_template_html"]), function(content) {
                    if (client_settings.hasOwnProperty("_extra_button_template_css")) {
                        const css_url = chrome.runtime.getURL("templates/clients/" + client_settings["_directory"] + "/" + client_settings["_extra_button_template_css"]);

                        content = content.replace('__CSS_URL__', css_url);
                    }

                    let unique_ref = null;
                    let barcode_var_string = null;
                    let barcode_height = null;
                    let barcode_width = null;

                    if (client_settings.hasOwnProperty("_custom_barcode_var")) {
                        barcode_var_string = client_settings["_custom_barcode_var"];
                    }

                    if (client_settings.hasOwnProperty("_custom_barcode_height")) {
                        barcode_height = client_settings["_custom_barcode_height"];
                    }

                    if (client_settings.hasOwnProperty("_custom_barcode_width")) {
                        barcode_width = client_settings["_custom_barcode_width"];
                    }

                    if (client_settings.hasOwnProperty("_custom_unique_ref")) {
                        unique_ref = client_settings["_custom_unique_ref"];
                    }

                    sendResponse({
                        content: content,
                        custom: true,
                        unique_ref: unique_ref,
                        settings: {
                            barcode_var_string: barcode_var_string,
                            barcode_height: barcode_height,
                            barcode_width: barcode_width
                        }
                    });
                })
            } else {
                sendResponse({
                    custom: false
                });
            }
        } else {
            sendResponse({
                custom: false
            });
        }
    });
}

function getBrandPrintIframeContent(request, sendResponse) {
    const brand = request.brand;
    console.log("Custom: Brand is: " + brand);

    getLocalFile(chrome.runtime.getURL("templates/brand-mappings.json"), function(response) {
        const mappings = JSON.parse(response);

        if (mappings.hasOwnProperty(brand)) {
            let client_settings;

            if (mappings.hasOwnProperty(brand)) {
                client_settings = mappings[brand];
            }

            if (client_settings.hasOwnProperty("_extra_button_template_html")) {
                getLocalFile(chrome.runtime.getURL("templates/brands/" + client_settings["_directory"] + "/" + client_settings["_extra_button_template_html"]), function(content) {
                    if (client_settings.hasOwnProperty("_extra_button_template_css")) {
                        const css_url = chrome.runtime.getURL("templates/brands/" + client_settings["_directory"] + "/" + client_settings["_extra_button_template_css"]);

                        content = content.replace('__CSS_URL__', css_url);
                    }

                    let unique_ref = null;
                    let barcode_var_string = null;
                    let barcode_height = null;
                    let barcode_width = null;

                    if (client_settings.hasOwnProperty("_custom_barcode_var")) {
                        barcode_var_string = client_settings["_custom_barcode_var"];
                    }

                    if (client_settings.hasOwnProperty("_custom_barcode_height")) {
                        barcode_height = client_settings["_custom_barcode_height"];
                    }

                    if (client_settings.hasOwnProperty("_custom_barcode_width")) {
                        barcode_width = client_settings["_custom_barcode_width"];
                    }

                    if (client_settings.hasOwnProperty("_custom_unique_ref")) {
                        unique_ref = client_settings["_custom_unique_ref"];
                    }

                    sendResponse({
                        content: content,
                        custom: true,
                        unique_ref: unique_ref,
                        settings: {
                            barcode_var_string: barcode_var_string,
                            barcode_height: barcode_height,
                            barcode_width: barcode_width
                        }
                    });
                })
            } else {
                sendResponse({
                    custom: false
                });
            }
        } else {
            sendResponse({
                custom: false
            });
        }
    });
}
*/

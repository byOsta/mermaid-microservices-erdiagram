var showAll = true;
var showAllFields = true;
var listFiles = [];
var erDiv;
var allMicroservicesIntegration = null;
mermaid.initialize({ startOnLoad: true });

var getFiles =
    fetch("/microservices/", {
        headers: {
            "Accept": "application/json, text/plain, */*",
        },
    })
        .then((response) => response.json())
        .then(function (data) {
            return data;
        });

const getFile = async function (x) {
    fetch("/microservices/" + x, {
        headers: {
            "Accept": "application/json, text/plain, */*",
        },
    })
        .then((response) => response.text())
        .then(function (data) {
            return data;
        })
}



window.onload = async () => {
    erDiv = document.getElementById('erDiv');

    var files = (await getFiles).sort().filter((fileName) => fileName.includes(".mmd"));

    files.forEach(element => {
        if (element != "allMicroservicesIntegration.mmd") {
            listFiles.push({ fileName: element.replace(".mmd", ""), show: true, showFields: true, text: "", tables: [] })
        } else {
            fetch("/microservices/allMicroservicesIntegration.mmd", {
                headers: {
                    "Accept": "application/json, text/plain, */*",
                },
            }).then((response) => response.text())
                .then(function (data) {
                    allMicroservicesIntegration = data;
                })
        }
    });

    await Promise.all(listFiles.map(file =>
        fetch("/microservices/" + file.fileName + ".mmd", {
            headers: {
                "Accept": "application/json, text/plain, */*",
            },
        })
            .then((response) => response.text())
            .then(function (data) {
                file.text = data;
            })
    ))

    //Empty body
    var tableBody = document.querySelector("div.menu tbody");
    tableBody.innerHTML = "";


    listFiles.forEach((element, index) => {

        //Get Entities (Defined on ER)
        var textToAnalyze = element.text.replace("erDiagram\n", "").replace("erDiagram\r\n", "").replace(/(?:[^\S\r\n]|[a-zA-Z0-9\"-])*{[\(\)\n\r\sa-zA-Z0-9\"]*}[\r\n]*/gm, "");

        const matches = textToAnalyze.matchAll(/[| {]+([a-zA-Z0-9-]+|[" a-zA-Z0-9-]+)[|{ }:]+/gm);

        for (const match of matches) {
            var table = match[1].replaceAll('"', "");
            element.tables.indexOf(table) === -1 && !isEmptyOrWhitespace(table) ? element.tables.push(table) : false;

        }

        //Get Entities (Defined on Table)
        const matches2 = element.text.replace("erDiagram\n", "").replace("erDiagram\r\n", "").matchAll(/([^\S\r\n]|[a-zA-Z0-9\"-])*{[\(\)\n\r\sa-zA-Z0-9\"]*}[\r\n]*/gm);
        for (const match of matches2) {

            const match4 = match[0].match(/[ a-zA-Z0-9\"-]*/gm)[0].trim();
            var table = match4.replaceAll('"', "");

            element.tables.indexOf(table) === -1 && !isEmptyOrWhitespace(table) ? element.tables.push(table) : false;

        }


        //add Tr to table

        var toAppend = `<tr>
            <td>${element.fileName}</td>
            <td> <input type="checkbox" checked="" id="service-${index + 1}-show"></td>
            <td> <input type="checkbox" checked id="service-${index + 1}-showFields"></td>
        </tr>
        `
        tableBody.innerHTML += toAppend;

    });



    show()






    const showAllBtn = document.querySelector('.headBtn-show');
    const showAllFieldsBtn = document.querySelector('.headBtn-showFields');

    showAllBtn.addEventListener('click', function () {
        showAll = showAll != null ? !showAll : true;

        if (showAll) {
            showAllBtn.classList.remove("hideAll");
            showAllBtn.classList.add("showAll");

            document.querySelectorAll("[id$='-show']").forEach(chk => {
                if (chk.checked == false) {
                    chk.checked = true;
                    let event = new Event('change');
                    chk.dispatchEvent(event);
                }
            })



        } else {
            showAllFields = false;

            showAllBtn.classList.remove("showAll");
            showAllBtn.classList.add("hideAll");

            document.querySelectorAll("[id$='-show']").forEach(chk => {
                chk.checked = false;
                let event = new Event('change');
                chk.dispatchEvent(event);


            })

            showAllFieldsBtn.classList.remove("showAll");
            showAllFieldsBtn.classList.add("hideAll");

        }

    });

    showAllFieldsBtn.addEventListener('click', function () {

        if (showAll == null || showAll != false) {
            showAllFields = showAllFields != null ? !showAllFields : true;
            if (showAllFields) {
                showAllFieldsBtn.classList.remove("hideAll");
                showAllFieldsBtn.classList.add("showAll");

                document.querySelectorAll("[id$='-showFields']:not(:disabled)").forEach(chk => {
                    chk.checked = true
                    let event = new Event('change');
                    chk.dispatchEvent(event);

                })

            } else {
                showAllFieldsBtn.classList.remove("showAll");
                showAllFieldsBtn.classList.add("hideAll");

                document.querySelectorAll("[id$='-showFields']").forEach(chk => {
                    chk.checked = false
                    let event = new Event('change');
                    chk.dispatchEvent(event);

                })

            }
        }

    });

    const allServicesCheckbox = document.querySelectorAll('tbody tr input');

    allServicesCheckbox.forEach(el => {
        el.addEventListener('change', function (event) {

            var serviceId = [...event.target.id.matchAll(/service-([0-9]+)-show/gm)][0][1] - 1;

            //main service
            if (event.target.id.endsWith("-show")) {
                var tr = event.target.parentElement.parentElement;
                var showFds = tr.querySelector("[id$='-showFields']");

                updateShow(serviceId, this.checked)

                if (this.checked) {
                    showFds.disabled = false
                    showFds.checked = showAllFields ?? false
                    let event = new Event('change');
                    showFds.dispatchEvent(event);
                } else {
                    showFds.disabled = true
                    showFds.checked = false
                    let event = new Event('change');
                    showFds.dispatchEvent(event);
                }

                if ([...document.querySelectorAll("[id$='-show']")].every(x => x.checked == true)) {
                    showAllBtn.classList.remove("hideAll");
                    showAllBtn.classList.add("showAll");
                    showAll = true;

                } else if ([...document.querySelectorAll("[id$='-show']")].every(x => x.checked == false)) {
                    showAllBtn.classList.remove("showAll");
                    showAllBtn.classList.add("hideAll");
                    showAll = false;
                } else {
                    showAllBtn.classList.remove("showAll");
                    showAllBtn.classList.remove("hideAll");
                    showAll = null;

                }

            } else if (event.target.id.endsWith("-showFields")) {
                updateShowFields(serviceId, this.checked)

                if (this.checked) {
                } else {
                    updateShowFields(serviceId, this.checked)
                }

                if ([...document.querySelectorAll("[id$='-showFields']:not(:disabled)")].every(x => x.checked == true)) {
                    showAllFieldsBtn.classList.remove("hideAll");
                    showAllFieldsBtn.classList.add("showAll");
                    if ([...document.querySelectorAll("[id$='-showFields']:not(:disabled):checked")].length > 0) {
                        showAllFields = true;

                    } else {
                        showAllFields = false;

                    }
                } else if ([...document.querySelectorAll("[id$='-showFields']")].every(x => x.checked == false)) {
                    showAllFieldsBtn.classList.remove("showAll");
                    showAllFieldsBtn.classList.add("hideAll");
                    showAllFields = false;
                } else {
                    showAllFieldsBtn.classList.remove("showAll");
                    showAllFieldsBtn.classList.remove("hideAll");
                    showAllFields = false;

                }
            }

            show()

        });
    })

};

function updateShow(index, val) {
    listFiles[index].show = val;
}

function updateShowFields(index, val) {
    listFiles[index].showFields = val;
}

function getlineNumberofChar(data, index) {
    var perLine = data.split('\n');
    var total_length = 0;
    for (i = 0; i < perLine.length; i++) {
        total_length += perLine[i].length;
        if (total_length >= index)
            return perLine[i];
    }
}

const show = async function () {
    var diagram = "erDiagram\n";
    listFiles.forEach(element => {
        //Show on diagram
        if (element.show) {
            var curatedText = element.text.replace("erDiagram\n", "").replace("erDiagram\r\n", "");

            if (!element.showFields) {
                var tableBlocks = curatedText.matchAll(/(?:[^\S\r\n]|[a-zA-Z0-9\"-])*{([\(\)\n\r\sa-zA-Z0-9\"\,]*)}[\r\n]*/gm);

                var diagramWithoutBlocks = curatedText.replace(/(?:[^\S\r\n]|[a-zA-Z0-9\"-])*{[\(\)\n\r\sa-zA-Z0-9\"\,]*}[\r\n]*/gm, "");

                diagram += diagramWithoutBlocks;
                for (const matchtable of tableBlocks) {
                    var tableWithoutContent = matchtable[0].replace(matchtable[1], "");
                    diagram += tableWithoutContent;
                }
            } else {
                diagram += curatedText;
            }
        }
    })

    //allMicroservicesIntegration
    var currentTables = [];
    listFiles.forEach(x => {
        if (x.show) {
            x.tables.forEach(y =>
                currentTables.indexOf(y) === -1 && !isEmptyOrWhitespace(y) ? currentTables.push(y) : false);
        }
    })
    var integrationMatches = [...allMicroservicesIntegration.matchAll(/(["a-zA-Z ]+)(?:\||}|:)/gm)];
    console.log(currentTables)

    for (var i = 0; i < integrationMatches.length; i += 2) {

        var line = getlineNumberofChar(allMicroservicesIntegration, integrationMatches[i].index)

        // console.log(line)
        console.log()
        console.log()

        if (currentTables.includes(integrationMatches[i][1].trim().replace('"', "")) &&
            currentTables.includes(integrationMatches[i + 1][1].trim().replace('"', ""))) {
            diagram += line;

        }


    }

    mermaid.render('graphDivInner', diagram, function (svgCode) {
        erDiv.innerHTML = svgCode;
    });


    //Zoom / Pan
    var svgs = d3.selectAll("#erDiv svg");
    svgs.each(function () {
        var svg = d3.select(this);
        svg.html("<g>" + svg.html() + "</g>");
        var inner = svg.select("g");
        var zoom = d3.zoom().on("zoom", function (event) {
            inner.attr("transform", event.transform);
        });
        svg.call(zoom);
    });

    applyStyles()
}

function applyStyles() {

    listFiles.forEach((file, index) => {
        var currentFile = index + 1;
        file.tables.forEach(table => {

            var simplifiedTable = table.trim().replaceAll(" ", "").replaceAll("-", "")
            document.querySelectorAll(`#erDiv [id*="entity-${simplifiedTable}-"] .er.entityBox`).forEach(el => {
                var currentAttr = el.getAttribute("style") ?? "";
                el.setAttribute("style", currentAttr.concat(`fill: ${getCssVariable(`--color-${currentFile}`)}; stroke: ${getCssVariable(`--darker-color-${currentFile}`)};`));
            });

            document.querySelectorAll(`[id*="entity-${simplifiedTable}-"] .er.entityLabel`).forEach(el => {
                var currentAttr = el.getAttribute("style") ?? "";
                el.setAttribute("style", currentAttr.concat(` fill: ${getCssVariable(`--font-${currentFile}`)};`));
            });

            document.querySelectorAll(`#erDiv [id*="entity-${simplifiedTable}-"] .er.entityLabel ~ .er.entityLabel`).forEach(el => {
                var currentAttr = el.getAttribute("style") ?? "";
                el.setAttribute("style", currentAttr.concat(` fill: black;`));
            });

            document.querySelectorAll(`#erDiv [id*="entity-${simplifiedTable}-"] .er.attributeBoxOdd, #erDiv [id*="entity-${simplifiedTable}-"] .er.attributeBoxEven`).forEach(el => {
                var currentAttr = el.getAttribute("style") ?? "";
                el.setAttribute("style", currentAttr.concat(` stroke: ${getCssVariable(`--darker-color-${currentFile}`)};`));
            });
        });

    })
}

function isEmptyOrWhitespace(str) {
    return str === null || str.match(/^ *$/) !== null;
}

function getCssVariable(variableName) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(variableName);
}
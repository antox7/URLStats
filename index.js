document.getElementById('fileUploadButton').onchange = function () {
    var file = this.files[0];
    var reader = new FileReader();
    let urlHistory = [];

    reader.onload = function (progressEvent) {

        let lines = this.result.split('\n');
        lines.forEach(line => {
            if (line == "") { return }
            const url = new URL(line);

            if (url) {
                var xhttp = httpGet("https://dns.google.com/resolve?name=" + url.hostname);
                let myjson = JSON.parse(xhttp);
                if (myjson.Answer && myjson.Answer[1]) {
                    url.ip = myjson.Answer[1].data;
                }
                else {
                    url.ip = "unresolved";
                }

                // add TLD
                if (url.host) {
                    url.tld = url.host.replace(/^(?:[^\/]+\.)?([^.\/]+\.[^.\/]+).*$/, "$1");

                }

            }
            console.log(url)
            urlHistory.push(url);
        });



    }

    reader.readAsText(file);

    reader.onloadend = function (progressEvent) {

        // Draw Table
        let table = getTable(urlHistory);
        document.getElementById('history').outerHTML = table;

        // Draw Statistics
        let summary = getSummary(urlHistory, document.getElementById('summary'));
        // document.getElementById('summary').outerHTML = summary;

    }

    function httpGet(theUrl) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false); // false for synchronous request
        xmlHttp.send(null);
        return xmlHttp.responseText;
    }

    function getTable(history) {

        let table = "<table class='table' width='100%'>" +
            "<tr>" +
            "<th>URL</th>" +
            "<th>Scheme</th>" +
            "<th>User</th>" +
            "<th>Host</th>" +
            "<th>Port</th>" +
            "<th>Path</th>" +
            "<th>Query</th>" +
            "<th>Fragment</th>" +
            "<th>IP Address</th>" +
            "</tr >";

        history.forEach(url => {
            table += "<tr>";
            table += "<td>" + url.href + "</td>";
            table += "<td>" + url.protocol + "</td>";
            table += "<td>" + url.username + "</td>";
            table += "<td>" + url.hostname + "</td>";
            table += "<td>" + url.port + "</td>";
            table += "<td>" + url.pathname + "</td>";
            table += "<td>" + url.search + "</td>";
            table += "<td>" + url.hash + "</td>";
            table += "<td>" + url.ip + "</td>";
            table += "</tr>";
        });

        table += "</table >"
        return table;

    };

    function getSummary(history, div) {

        let summary = {};

        // Make array for each type of data
        history.forEach(element => {
            for (var key in element) {

                if (key == "username") { continue; }
                if (key == "password") { continue; }
                if (key == "hash") { continue; }
                if (key == "host") { continue; }
                if (key == "origin") { continue; }
                if (key == "searchParams") { continue; }
                if (key == "toString") { continue; }
                if (key == "toJSON") { continue; }

                if (summary[key] == null) {
                    summary[key] = [];
                    summary[key].push(element[key]);
                }
                else {
                    summary[key].push(element[key]);
                }
            }
        });

        google.charts.load('current', { 'packages': ['corechart'] });
        google.charts.setOnLoadCallback(() => {

            for (var key in summary) {
                // Create the data table.
                let counts = [];
                summary[key].forEach(function (x) {
                    counts[x] = (counts[x] || 0) + 1;
                });
                let arrData = Object.entries(counts);

                console.log(arrData)

                // Create the data table.
                var data = new google.visualization.DataTable();
                data.addColumn('string', 'Prop');
                data.addColumn('number', 'Count');
                data.addRows(arrData);

                // Set chart options
                var options = {
                    'title': formatKey(key),
                    'width': '100%',
                    'height': 400,
                    'border': '1px solid aliceblue',
                };

                // Instantiate and draw our chart, passing in some options.

                var div = document.createElement("div");
                div.className = "summaryElement";
                document.getElementById('summary').appendChild(div);

                var chart = new google.visualization.PieChart(div);

                chart.draw(data, options);

            };

        });

    };

    function formatKey(_key) {
        key = _key;

        if (key == "tld") { key = "Top Level Domain"; }
        if (key == "ip") { key = "IP Address"; }
        if (key == "href") { key = "URL"; }
        if (key == "protocol") { key = "Scheme"; }
        if (key == "pathname") { key = "Path"; }
        if (key == "searchparams") { key = "Search Parameters"; }
        if (key == "hash") { key = "Fragment"; }
        return toTitleCase(key);
    }

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
}
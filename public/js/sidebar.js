let ctrlToolbar = {
    initTreeChart: function() {
        d3.selectAll(".toolbar-button")
            .attr("disabled", null);
        // control zoom (+/-)
        const duration = 500;
        d3.select("#zoom-in").on("click", () => {
            viewZoom.zoom
                .scaleBy(viewZoom.svg.transition().duration(duration), 1.3);
        });
        d3.select("#zoom-out").on("click", () => {
            viewZoom.zoom
                .scaleBy(viewZoom.svg.transition().duration(duration), 1 / 1.3);
        });
        // control fontsize
        d3.select("#font-up").on("click", () => {
            let labels = d3.selectAll(".node-label"),
                fontSize = parseInt(labels.style("font-size")),
                maxFontSize = 20;
            if (fontSize < maxFontSize) {
                labels.style("font-size", ++fontSize + "px")
            }
        });
        d3.select("#font-down").on("click", () => {
            let labels = d3.selectAll(".node-label"),
                fontSize = parseInt(labels.style("font-size")),
                minFontSize = 9;
            if (fontSize > minFontSize) {
                labels.style("font-size", --fontSize + "px")
            }
        });
        // toggle nodes and node-labels respectively
        d3.select("#toggle-node-circles").on("click", () => {
            d3.selectAll(".node")
                .classed("node-normalized", d3.selectAll(".node").classed("node-normalized") ? false : true);
        });
        d3.select("#toggle-node-labels").on("click", () => {
            let labels = d3.selectAll(".node-label"),
                display = labels.style("display");
            
            if (display === "block") {
                labels.style("display", "none");
                viewTreeChart.drawLabels = false;
            } else {
                labels.style("display", "block");
                viewTreeChart.drawLabels = true;
            }
        });
        // customize color palette
        d3.select("#color-palette").on("click", () => {
            let palettePicker = jsPanel.create();
        })

        // slider controls color based on taxonomic rank (kingdom, phylum, etc ...)
        const slider = d3.select("#toolbar-slider"),
            colorLabel = d3.select("#color-rank");
        
        slider.attr("disabled", null);
        slider.on("input", () => {
            const { color, taxonRanks } = ctrlMain.getHierarchical();
            const { taxonLevelColor, branchColor } = color;
            color.currentRank = parseInt(slider.valueOf()._groups[0][0].value);
            colorLabel.text(taxonRanks[color.currentRank]);
            d3.selectAll(".node circle")
                .style("fill", (d) => viewTreeChart.colorNode(d, taxonLevelColor, branchColor))
        });
    },
    initTreemapChart: function () {
        // Disable font and toggle buttons
        d3.selectAll("#toggle-node-circles")
            .attr("disabled", true);
        d3.selectAll(".zoom-button, .font-button, #toggle-node-labels")
            .attr("disabled", null);

        // control depth of depth of nodes/rectangles
        d3.select("#zoom-in").on("click", () => {
            if (viewStaticTreemapChart.drawDepth < 7) {
                viewStaticTreemapChart.drawDepth++;
                viewStaticTreemapChart.render();
            }
        });
        d3.select("#zoom-out").on("click", () => {
            if (viewStaticTreemapChart.drawDepth > 0) {
              viewStaticTreemapChart.drawDepth--;
              viewStaticTreemapChart.render();
            }
        });
        // control fontsize
        d3.select("#font-up").on("click", () => {
            let labels = d3.selectAll(".node-label"),
                fontSize = parseInt(labels.style("font-size")),
                maxFontSize = 20;
            if (fontSize < maxFontSize) {
                labels.style("font-size", ++fontSize + "px")
            }
        });
        d3.select("#font-down").on("click", () => {
            let labels = d3.selectAll(".node-label"),
                fontSize = parseInt(labels.style("font-size")),
                minFontSize = 9;
            if (fontSize > minFontSize) {
                labels.style("font-size", --fontSize + "px")
            }
        });
        // Toggle node labels
        d3.select("#toggle-node-labels").on("click", () => {
            let labels = d3.selectAll(".node-label"),
                display = labels.style("display");
            
            if (display === "block") {
                labels.style("display", "none");
                viewTreeChart.drawLabels = false;
            } else {
                labels.style("display", "block");
                viewTreeChart.drawLabels = true;
            }
        });
        // slider controls color based on taxonomic rank (kingdom, phylum, etc ...)
        const slider = d3.select("#toolbar-slider"),
            colorLabel = d3.select("#color-rank");
        
        slider.attr("disabled", null);
        slider.on("input", () => {
            const { color, taxonRanks } = ctrlMain.getHierarchical();
            const { taxonLevelColor, branchColor } = color;
            color.currentRank = parseInt(slider.valueOf()._groups[0][0].value);
            colorLabel.text(taxonRanks[color.currentRank]);
            d3.selectAll("rect")
                .style("fill", (d) => viewStaticTreemapChart.colorNode(d, taxonLevelColor, branchColor))
        });
    },
    initExport: function() {
        // Export buttons
        d3.select("#convert-svg").on("click", () => {
            if (! document.querySelector("#chart-display g")) {
                alert("No chart to export!")
            } else {
                // Really hacky, pls rework
                let svgData = document.querySelector("#chart-display").outerHTML.replace("</svg>", "<style>"),
                    sheets = document.styleSheets,
                    style;
                for (let i = 0; i < sheets.length; i++) {
                    if (sheets[i].href && sheets[i].href.match("charts.css")) {style = sheets[i].cssRules || sheet[i].rules;}
                }
                for (let i = 0; i < style.length; i++) {
                    svgData += style[i].cssText;
                }
                svgData += "</style></svg>";
                
                let svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"}),
                    svgUrl = URL.createObjectURL(svgBlob),
                    downloadLink = document.createElement("a");
        
                downloadLink.href = svgUrl;
                downloadLink.download = "visualization.svg";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
        });
    }
}

let viewSamples = {
    init: function() {
        this.menu = [    
            {
                title: "Remove",
                action: function (ele, d, i) {
                    ele.remove();                    
                }
            }
        ];
    },
    clearPrevious: function() {
        d3.select("#samples").selectAll("*").remove();
    },
    addSample: function(sampleName) {
        // Add to list and attach contextmenu
        let newSampleOption = document.createElement("option"),
            newSampleText = document.createTextNode(sampleName),
            sampleList = document.querySelector("#samples");

        newSampleOption.id = sampleName;
        newSampleOption.classList.add("sample-option");
        newSampleOption.appendChild(newSampleText);
        sampleList.appendChild(newSampleOption);
        d3.select(newSampleOption).on("contextmenu", d3.contextMenu(this.menu));
    },
    drawTable: function (data) {
        d3.select("#csv-display").style("display", "block");
        d3.select("#chart-display").style("display", "none");
        // Reset and generate the top row (col names)
        let cols = data.columns,
            topRow = document.createElement("tr"),
            tableHead = document.querySelector(".csv-data thead");
        while (tableHead.firstChild) {
            tableHead.removeChild(tableHead.firstChild);
        }
        let numCol = document.createElement("th"),
            numColText = document.createTextNode("#");
        numCol.appendChild(numColText);
        topRow.appendChild(numCol);
        cols.forEach((colName) => {
            let newCol = document.createElement("th"),
                newColText = document.createTextNode(colName);
            newCol.appendChild(newColText);
            newCol.scope = "col";
            topRow.appendChild(newCol);
        });
        tableHead.appendChild(topRow);
        
        // Reset and generate remaining rows (actual data)
        let tableBody = document.querySelector(".csv-data tbody");
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }
        data.forEach((d, i) => {
            let newRow = document.createElement("tr");
            let numRow = document.createElement("th"),
                numRowText = document.createTextNode(i + 1);
            numRow.appendChild(numRowText);
            newRow.appendChild(numRow);
            cols.forEach((col) => {
                let newCell = document.createElement("td"),
                    newCellText = document.createTextNode(d[col]);
                newCell.appendChild(newCellText);
                newRow.appendChild(newCell);
            });
            tableBody.appendChild(newRow);
        });
    }
}

let viewMiniChart = {
    init: function(data) {
        this.svg = d3.select("#mini-chart");
        this.svg.selectAll("*").remove();
        const width = parseFloat(this.svg.style("width")),
            height = parseFloat(this.svg.style("height"));
        this.margin = {
            x: width * 0.15,
            y: height * 0.1
        }
        const { svg, margin } = this;
        this.chart = d3.select("#mini-chart").append("g")
            .style("transform", `translate(${margin.x}px, ${margin.y}px)`);
        
        // Value selection:
        d3.select("#abs-option").on("change", () => console.log(123))
        d3.select("#normalized-option").on("change", () => console.log(456))
        
        // Set up scales
        this.xScale = d3.scaleLinear()
            .range([0, width - 2 * margin.x]);
        this.yScale = d3.scaleBand()
            .range([0, height - 2 * margin.y])
            .padding(0.5);

        this.scalesToSamples(data);

        // x-axis label
        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("y", height - 5)
            .attr("x", width / 2)
            .style("font", "sans-serif")
            .style("font-size", "10px")
            .style("fill", "black")
            .text("MS Intensity")

        // Draw axes
        svg.append("g")
            .attr("class", "x-axis")
            .style("transform", `translate(${margin.x}px,${height - margin.y}px)`)
            .call(this.xAxis);
        svg.append("g")
            .attr("class", "y-axis")
            .style("transform", `translate(${margin.x}px, ${margin.y}px)`)
            .call(this.yAxis);
    },
    scalesToSamples: function(data) {
        // Helper function for this.renderSamples
        let areSamples = data[0].samples;
        if (!areSamples) { return }

        // Find max value of MS intensities in all samples, for unbiased x-axis
        let values = [];
        data.forEach(ele => { values = values.concat(Object.values(ele.samples)); });
        const maxVal = d3.max(values);
        
        this.samples =  Object.keys(data[0].samples).map((ele) => {
            return ele.replace("Intensity", "").trim();
        });

        this.xScale.domain([0, maxVal]);
        this.yScale.domain(this.samples);

        this.xAxis = d3.axisBottom(this.xScale)
            .tickFormat(d3.format(".4g"))
            .ticks(3);
        this.yAxis = d3.axisLeft(this.yScale);
    },
    scalesToSubtaxa: function(sample, data) {
        // Helper function for this.renderSubtaxa

        // Find max value of MS intensity in given sample, for unbiased x-axis
        let values = [];
        if (sample) { data.forEach(d => values.push(d.samples[sample])); }
        else { data.forEach(d => values.push(d.avgIntensity)); }
        const maxVal = d3.max(values);
        const subtaxa = data.map(d => d.taxon);

        this.xScale.domain([0, maxVal]);
        this.yScale.domain(subtaxa);

        this.xAxis = d3.axisBottom(this.xScale)
            .tickFormat(d3.format(".4g"))
            .ticks(3);
        this.yAxis = d3.axisLeft(this.yScale);
    },
    renderSamples: function(name, data) {
        // data:
        // d[0] = sample name
        // d[1] = sample intensity

        this.scalesToSamples(ctrlMain.getCurrentData());
        d3.select(".x-axis").call(this.xAxis);
        d3.select(".y-axis").call(this.yAxis);

        const { svg, chart, margin, xScale, yScale } = this,
            format = d3.format(".4g"),
            tooltip = d3.select(".tooltip"),
            duration = 200;
        // Draw title
        svg.select(".mini-chart-title").remove()
        svg.append("text")
            .attr("class", "mini-chart-title")
            .text(name)
            .style("font", "sans-serif")
            .style("font-size", "14px")
            .attr("text-anchor", "middle")
            .attr("x", "50%")
            .attr("y", margin.y - 10);

        // Draw bar chart
        const bar = chart.selectAll(".bar").data(data, d => d[0]);
        const barsEnter = bar.enter().append("rect")
            .attr("class", "bar")
            .on("mouseover", function() {
                d3.select(this).transition()
                    .duration(duration)
                    .style("opacity", 0.5);
                tooltip.transition()
                    .duration(duration)
                    .style("opacity", 0.9);
            })
            .on("mousemove", function(d) {
                let height = tooltip.node().clientHeight;
                tooltip.html(`<strong>Sample</strong>: ${d[0]}<br><strong>MS Intensity</strong>: ${format(d[1])}`)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - height) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).transition()
                    .duration(duration)
                    .style("opacity", 1);
                tooltip.transition()
                    .duration(duration)
                    .style("opacity", 0);
            });
    
        const currentBar = bar.merge(barsEnter)
            .attr("height", yScale.bandwidth())
            .attr("y", (d, i) => yScale(this.samples[i]))
            .attr("fill", "#2a5599");
        
        currentBar.transition().duration(750)
            .attr("width", (d) => xScale(d[1]));

        bar.exit().remove();
    },
    renderSubtaxa: function(sample, parent) {
        // For comparing proportions of subtaxa of parent node
        const data = parent.children.map(d => d.data);

        this.scalesToSubtaxa(sample, data);
        d3.select(".x-axis").call(this.xAxis);
        d3.select(".y-axis").call(this.yAxis);

        const { svg, chart, margin, xScale, yScale } = this,
            format = d3.format(".4g"),
            tooltip = d3.select(".tooltip"),
            duration = 200;

        // Draw title
        svg.select(".mini-chart-title").remove()
        svg.append("text")
            .attr("class", "mini-chart-title")
            .text(sample ? sample : "Average Intensity")
            .style("font", "sans-serif")
            .style("font-size", "14px")
            .attr("text-anchor", "middle")
            .attr("x", "50%")
            .attr("y", margin.y - 10);

        // Draw bar chart
        const bar = chart.selectAll(".bar").data(data, d => d.taxon);
        const barsEnter = bar.enter().append("rect")
            .attr("class", "bar")
            .on("mouseover", function(d) {
                d3.select(this).transition()
                    .duration(duration)
                    .style("opacity", 0.5);
                tooltip.transition()
                    .duration(duration)
                    .style("opacity", 0.9);
            })
            .on("mousemove", function(d) {
                let height = tooltip.node().clientHeight;
                let proportion;
                if (sample) { proportion = d.samples[sample] / parent.data.samples[sample]; }
                else { proportion = d.avgIntensity / parent.data.avgIntensity; }
               
                tooltip.html(`<strong>Taxon</strong>: ${d.taxon} (${d.rank})<br><strong>MS Intensity</strong>: ${format(sample ? d.samples[sample] : d.avgIntensity)}<br><br>
                               <i class="fas fa-chart-pie"></i> \t${d3.format(".1%")(proportion)} of ${parent.data.taxon}`)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - height) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).transition()
                    .duration(duration)
                    .style("opacity", 1);
                tooltip.transition()
                    .duration(duration)
                    .style("opacity", 0);
            });

        let currentBar = bar.merge(barsEnter)
            .attr("height", yScale.bandwidth())
            .attr("y", d => yScale(d.taxon))
            .attr("fill", "#2a5599");
        
        currentBar.transition().duration(750)
            .attr("width", d => xScale(sample ? d.samples[sample] : d.avgIntensity))

        bar.exit().remove();
    }
}

let width = 800, height = 800;

let svg = d3.select("svg")
    .attr("width", width)
    .attr("height", height);

Promise.all([d3.json("links-sample.json"), d3.json("cases-sample.json")]).then(data => {

    // Data preprocessing
    data[0].forEach(e => {
        e.source = e.infector;
        e.target = e.infectee;
    });

    let links = data[0] //Person's information (our nodes)
    let caseNodes = data[1] //Source and target of each nodes

    //SCheck data
    links.forEach((linkNode) => {
        console.log(linkNode)
        console.log(linkNode.infectee)
        console.log(linkNode.infector)
    })
    caseNodes.forEach((node) => {
        console.log(node)
        console.log(node.occupation)
    })

    //Dragging 
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    };

    //Set up a colorScale, let F = 0, M = 1 in domain
    let colorScale = d3.scaleOrdinal()
        .domain([0, 1])
        .range(["#FFC0CB", "#005073"])

    svg.append("svg:defs").append("svg:marker")
        .attr("id", "triangle")
        .attr("refX", 13)
        .attr("refY", 5)
        .attr("markerWidth", 30)
        .attr("markerHeight", 30)
        .attr("markerUnits", "userSpaceOnUse")
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 12 6 0 12 3 6")
        .style("fill", "#555")

    //Set up data
    //Set up links
    //Already done

    //tooltip is style by CSS, we will change it's appearance in the mouse events 
    var tooltip = d3.select(".tooltip")
    let node = svg.append("g")
        .attr("id", "nodes")
        .selectAll("circle")
        .data(caseNodes)
        .enter()
        .append("circle")
        .attr("r", 25)
        .style("stroke-width", "5")
        .style("stroke-dasharray", 10)
        .style("stroke", (d) => {
            if (d.vaccinated === "no") {
                return "red"
            } else {
                return "green"
            }
        })
        .style("fill", d => {
            if (d.gender == 'male') {
                return colorScale(1)
            } else {
                return colorScale(0)
            }
        })
        .on("mouseover", function (e) {
            tooltip.style("visibility", "visible")

            d3.select(e.currentTarget)
                .attr("class", "hover")
                .style("position", "absolute")
                .style("background", "#fff")
                .style("left", (e.pageX) + "px")
                .style("top", (e.pageY) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");

        })
        .on("mousemove", function (e, d) {
            tooltip
                .style("top", (e.pageY + 10) + "px")
                .style("left", (e.pageX + 10) + "px")
                .html(
                    `<h4> Case no. ` + `${d.id}` + `</h4>`
                    + `<h4> Vaccination status: ` + `${d.vaccinated} </h4>`
                    + `<h4> Gender: ` + `${d.gender} </h4>`
                )
        }).call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
    


    let linkpath = svg.append("g")
        .attr("id", "links")
        .selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("marker-end", "url(#triangle)")

    //Set up the force simulation
    let simulation = d3.forceSimulation()
        .nodes(caseNodes)
        .force("x", d3.forceX().strength(0.5).x(width / 2))
        .force("y", d3.forceY().strength(0.2).y(height / 2))
        .force("charge", d3.forceManyBody().strength(-1300))
        .force("link", d3.forceLink(links).id(d => d.id).distance(150))
        .force("collide", d3.forceCollide().strength(1).radius(30))
        .on("tick", d => {
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            linkpath
                .attr("d", d => "M" + d.source.x + "," + d.source.y + " " + d.target.x + "," + d.target.y);
        })

    //Adding a legend
    var legend = d3.select("svg")

    legend.append("text")
        .attr("x", 50)
        .attr("y", 50)
        .text("Legend")
        .style("font-size", "20px")
        .attr("alignment-baseline","middle")

        //Male
    legend
    .append("circle")
    .attr("cx",50)
    .attr("cy",100)
    .attr("r", 15)
    .style("fill", "#005073")

        //Female
    legend
    .append("circle")
    .attr("cx",50)
    .attr("cy",150)
    .attr("r", 15)
    .style("fill", "#FFC0CB")

        //Vax border
    legend
    .append("circle")
    .attr("cx",50)
    .attr("cy",200)
    .attr("r", 15)
    .style("stroke-width", "5")
    .style("stroke-dasharray", 5)
    .style("stroke", "green")
    .style("fill", "grey")

        //Unvax border
    legend
    .append("circle")
    .attr("cx",50)
    .attr("cy",250)
    .attr("r", 15)
    .style("stroke-width", "5")
    .style("stroke-dasharray", 5)
    .style("stroke", "red")
    .style("fill", "grey")


    legend.append("text")
        .attr("x", 80)
        .attr("y", 100)
        .text("Male")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")

    legend.append("text")
        .attr("x", 80)
        .attr("y", 150)
        .text("Male")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")

    legend.append("text")
        .attr("x", 80)
        .attr("y", 200)
        .text("Vaccinated")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")

    legend.append("text")
        .attr("x", 80)
        .attr("y", 250)
        .text("Unvaccinated")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")


    
})


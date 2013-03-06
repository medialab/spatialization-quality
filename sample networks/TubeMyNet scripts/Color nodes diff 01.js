// We need to clear first, in case of previous drawings.
clear()

var xmin = Number.MAX_VALUE
	,xmax = Number.MIN_VALUE
	,ymin = Number.MAX_VALUE
	,ymax = Number.MIN_VALUE

graph.nodes.forEach(function(n){
	xmin = Math.min(xmin, n.x)
	xmax = Math.max(xmax, n.x)
	ymin = Math.min(ymin, n.y)
	ymax = Math.max(ymax, n.y)
	n.diff = 0
})

// Compute the distances
var idealmin = Number.MAX_VALUE
	,idealmax = Number.MIN_VALUE
	,idealtotal = 0
	,geomin = Number.MAX_VALUE
	,geomax = Number.MIN_VALUE
	,geototal = 0
	,count = 0

graph.edges.forEach(function(edge){
	if(edge.source.id < edge.target.id){
		edge.idealDist = 1 / edge.attributes_byId['weight']
		edge.geoDist = Math.sqrt(Math.pow(edge.source.x - edge.target.x, 2) + Math.pow(edge.source.y - edge.target.y, 2))
		count++
		idealmin = Math.min(idealmin, edge.idealDist)
		idealmax = Math.max(idealmax, edge.idealDist)
		idealtotal += edge.idealDist
		geomin = Math.min(geomin, edge.geoDist)
		geomax = Math.max(geomax, edge.geoDist)
		geototal += edge.geoDist
	}
})

var idealaverage = idealtotal / count
	,geoaverage = geototal / count
	// ,idealratio = Math.max(idealaverage - idealmin, idealmax-idealaverage)
	// ,georatio = Math.max(geoaverage - geomin, geomax-geoaverage)
	,normratio = geoaverage / idealaverage

graph.edges.forEach(function(edge){
	if(edge.source.id < edge.target.id){
		// edge.normIdeal = (edge.idealDist - idealaverage) / idealratio
		// edge.normGeo = (edge.geoDist - geoaverage) / georatio
		edge.diff = edge.geoDist - normratio * edge.idealDist
		edge.source.diff += edge.diff
		edge.target.diff += edge.diff
		/*var color
		if(edge.idealDist>=idealaverage){
			color = 'rgba(0, '+Math.round(255 * (edge.idealDist-idealaverage) / (idealmax-idealaverage) )+', 0, 0.1)'
		} else {
			color = 'rgba('+Math.round(255 * (idealaverage - edge.idealDist) / (idealaverage - idealmin) )+', 0, 0, 0.1)'
		}
		svg.line(
			edge.source.x,
			edge.source.y,
			edge.target.x,
			edge.target.y,
			{
				stroke:color
			}
		);*/
	}
})

var nodediffmin = Number.MAX_VALUE
	,nodediffmax = Number.MIN_VALUE

graph.nodes.forEach(function(n){
	nodediffmin = Math.min(nodediffmin, n.diff)
	nodediffmax = Math.max(nodediffmax, n.diff)
})

var colorRange = [chroma.hex('#FF8C67'), chroma.hex('#BBBBBB'), chroma.hex('#09D557')]
graph.nodes.forEach(function(node){
	var color
	if(node.diff<=0){
		var ratio = node.diff/nodediffmin
		color = chroma.rgb(
			 ratio * colorRange[0].rgb[0] + (1-ratio) * colorRange[1].rgb[0]
			,ratio * colorRange[0].rgb[1] + (1-ratio) * colorRange[1].rgb[1]
			,ratio * colorRange[0].rgb[2] + (1-ratio) * colorRange[1].rgb[2]
		)
	} else {
		var ratio = node.diff/nodediffmax
		color = chroma.rgb(
			 ratio * colorRange[2].rgb[0] + (1-ratio) * colorRange[1].rgb[0]
			,ratio * colorRange[2].rgb[1] + (1-ratio) * colorRange[1].rgb[1]
			,ratio * colorRange[2].rgb[2] + (1-ratio) * colorRange[1].rgb[2]
		)
	}


	svg.circle(
		node.x,
		node.y,
		20,
		{
			fill: color.hex()
		}
	)
})

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
	n.geoDist = 0
	n.idealDistNorm = 0
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
		edge.idealDistNorm = normratio * edge.idealDist
		edge.diff = edge.geoDist - edge.idealDistNorm
		
		edge.source.idealDistNorm += edge.idealDistNorm
		edge.target.idealDistNorm += edge.idealDistNorm
		
		edge.source.geoDist += edge.geoDist
		edge.target.geoDist += edge.geoDist

		edge.source.diff += edge.diff
		edge.target.diff += edge.diff
	}
})

var edgediffmin = Number.MAX_VALUE
	,edgediffmax = Number.MIN_VALUE

graph.edges.forEach(function(edge){
	if(edge.source.id < edge.target.id){
		edgediffmin = Math.min(edgediffmin, edge.diff)
		edgediffmax = Math.max(edgediffmax, edge.diff)
	}
})

var colorRange = [chroma.hex('#DE3C73'), chroma.hex('#999999'), chroma.hex('#1D7FA7')]
graph.edges.forEach(function(edge){
	if(edge.source.id < edge.target.id){
		var color
		if(edge.diff<=0){
			var ratio = edge.diff/edgediffmin
			color = chroma.rgb(
				 ratio * colorRange[0].rgb[0] + (1-ratio) * colorRange[1].rgb[0]
				,ratio * colorRange[0].rgb[1] + (1-ratio) * colorRange[1].rgb[1]
				,ratio * colorRange[0].rgb[2] + (1-ratio) * colorRange[1].rgb[2]
			)
		} else {
			var ratio = edge.diff/edgediffmax
			color = chroma.rgb(
				 ratio * colorRange[2].rgb[0] + (1-ratio) * colorRange[1].rgb[0]
				,ratio * colorRange[2].rgb[1] + (1-ratio) * colorRange[1].rgb[1]
				,ratio * colorRange[2].rgb[2] + (1-ratio) * colorRange[1].rgb[2]
			)
		}
		//console.log(edge.diff, edge.source.id, edge.target.id)
		svg.line(
				edge.source.x
				,edge.source.y
				,edge.target.x
				,edge.target.y
				,{
					fill: 'none'
					,stroke: color.hex()
					,'stroke-width': 0.4
				}
			)
	}
})

// Key
var keySettings = {
	position:{
		x: xmin
		,y: ymax + 60
	}
	,block:{
		w: 50
		,h: 30
	}
	,text:{
		leftMargin: 5
		,fontSize: 40
	}
	,h: 40
}

colorRange.forEach(function(color, i){
	var text
	switch(i){
		case 0:
			text = 'Too close (geo < ideal)'
			break
		case 1:
			text = 'At the right distance (geo = ideal)'
			break
		case 2:
			text = 'Too far (geo > ideal)'
			break
	}

	svg.rect(
			keySettings.position.x
			,keySettings.position.y + i * keySettings.h
			,keySettings.block.w
			,keySettings.block.h
			,0,0
			,{
				fill: color.hex()
			}
		)
	svg.text(
			keySettings.position.x + keySettings.block.w + keySettings.text.leftMargin
			,keySettings.position.y + i * keySettings.h + 0.5 * keySettings.block.h + 0.3 * keySettings.text.fontSize
			,text
			,{
				'font-size': keySettings.text.fontSize
			}
		)
})

/*
 * This file is part of the flypaper.js build. 
 * Use grunt to assemble the completed file.
 * Find the built file in dist/flypaper.js
 */


/*
 * Populate the colorspace with a colorset: 
 * check args passed on init for color palette info.
 * paletteName is a string matched against predefined
 * sets of colors. It can also be set to "custom", in 
 * which case a second parameter, colorSet, should contain
 * the list of colors to be included in the set.
*/

fly.colorPalette = function(paletteName,colorSet){
	
		// don't allow no-args reset to existing palette 
		if (fly.color.palette !== "not yet defined" && !paletteName) {
			return fly.color.palette;
		}

		switch(paletteName) {
			case "custom":
				var set = colorSet || [];
				break;

			case "pastel":
				set = [
					['red','#F04510','#FF7070','#FFD3C0'],
					['orange','#F28614','#FFB444','#FFE8C0'],
					['yellow','#CDB211','#FFFF70','#FFFFC0'],
					['green','#42622D','#89C234','#C0FFC0'],
					['blue','#00597C','#00A9EB','#B0E5FF'],
					['purple','#6F006F','#9F3DBF','#FFC0FF'],
					['grey','#383633','#A7A097','#FFFFFF']
				];
				break;

			case "sunny day":
				set = [
					['red','#2F060D','#FF361F','#FFCFC5'],
					['orange','#6D3200','#FF8125','#FFD1B6'],
					['yellow','#D6FF43','#FFFA95','#F4FFDA'],
					['green','#3B4D2A','#89C234','#A0FFA0'],
					['blue','#1D3852','#00A9EB','#9BCAE1'],
					['purple','#4C244C','#893DB3','#D0B8FF'],
					['grey','#1E2421','#848179','#D3FFE9']
				];
				break;			

			case "monotone":
				set = [
					['red','#1B1414','#584444','#FFE7E3'],
					['orange','#2A2620','#4D463A','#FFE9CC'],
					['yellow','#313125','#808061','#FAFFE0'],
					['green','#111611','#6E936E','#E7FFD3'],
					['blue','#0A0A0D','#696991','#E5D9FF'],
					['purple','#0D090D','#684E68','#FFE3EC'],
					['grey','#000000','#808080','#FFFFFF']
				];
				break;

			case "neon":
				set = [
					['red','#6A0032','#FF0023','#FFC0F2'],
					['orange','#BD2E00','#FFA500','#FFE8C0'],
					['yellow','#ACFF02','#FFFF00','#FFFFC0'],
					['green','#133B0F','#38FF41','#BFFF68'],
					['blue','#010654','#013BFF','#4FFFF8'],
					['purple','#3B034C','#9800B3','#CC5FFF'],
					['grey','#0A0511','#696281','#E3E8FF']			 
				];
				break;

			default:
				paletteName = "default";
				set = [
					['red','#400000','#FF0000','#FFC0C0'],
					['orange','#402900','#FFA500','#FFE8C0'],
					['yellow','#404000','#FFFF00','#FFFFC0'],
					['green','#004000','#00FF00','#C0FFC0'],
					['blue','#000040','#0000FF','#C0C0FF'],
					['purple','#400040','#800080','#FFC0FF'],
					['grey','#000000','#808080','#FFFFFF']
				];
		} // end switch
		
		fly.color.palette = paletteName;
		fly.color.setPalette(set);	
		fly.color.background();	
				
};
 

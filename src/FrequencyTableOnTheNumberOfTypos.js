/**
 * Generate a table with the frequency of each typo from [[w:Wikipédia:Software/Anti-vandal tool/Ortografia]]
 * @author: [[User:Helder.wiki]]
 * @tracking: [[Special:GlobalUsage/User:Helder.wiki/Tools/FrequencyTableOnTheNumberOfTypos.js]] ([[File:User:Helder.wiki/Tools/FrequencyTableOnTheNumberOfTypos.js]])
 */
/*jslint browser: true, white: true, plusplus: true */
/*global jQuery, mediaWiki, jsMsg */
( function ( $, mw /* , undefined */ ) {
'use strict';

var api;
function addRowToTable( word, hits ) {
	$('#search-results-body').append(
		'<tr><td><a href="'+mw.util.wikiGetlink('Special:Search') +
		'?profile=advanced&search=%22' + word + '%22&fulltext=Search&ns0=1&profile=advanced">' +
		word + '</a></td><td>' + hits + '</tr>'
	);
	$( '#mw-js-message' ).find( 'table' ).tablesorter();
}
function createEmptyTable() {
	jsMsg(
		'<table id="search-results" class="wikitable sortable"><thead><tr>' +
		'<th class="headerSort" title="Ordenar por ordem ascendente">Erro</th>' +
		'<th class="headerSort" title="Ordenar por ordem ascendente">Total</th>' +
		'</tr></thead><tbody id="search-results-body"></tbody></table>'
	);
}
function getHitsFor( word, remainingList ) {
	api.get( {
		action: 'query',
		list: 'search',
		format: 'json',
		srsearch: '"'+word+'"',
		srnamespace: 0,
		srinfo: 'totalhits',
		srprop: 'size',
		srlimit: 1/*,
		indexpageids: true*/
	}, {
		ok: function (data) {
			addRowToTable( word, data.query.searchinfo.totalhits );
			if(remainingList && $.isArray( remainingList ) && remainingList.length > 0 ){
				getHitsFor( remainingList.shift(), remainingList);
			}
		},
		error: function () {
			jsMsg('Ocorreu um erro. Por favor tente novamente.');
		}
	});
}

function getListFromWikiText( page ){
	api.get( {
		action:'query',
		prop:'revisions',
		format:'json',
		rvprop:'content',
		rvlimit:1,
		indexpageids: true,
		titles: page
	}, {
		ok: function (data) {
			var	text = data.query.pages[data.query.pageids[0]].revisions[0]['*'],
				list = text.split('\n'),
				pos, i;
			for(i=list.length-1; i>=0; i--){
				pos = list[i].indexOf('->');
				if (pos ===-1) {
					list.splice(i, 1);
				} else{
					list[i] = $.trim( list[i].substr(0,pos) );
					if (list[i].lenght === 0) {
						list.splice(i, 1);
					}
				}
			}
			createEmptyTable();
			getHitsFor( list.shift(), list);
		},
		error: function () {
			jsMsg('Ocorreu um erro ao obter a lista de erros comuns. Por favor tente novamente.');
		}
	});
}
function run(){
	mw.loader.using(['mediawiki.api', 'jquery.tablesorter'], function(){
		api = new mw.Api();
		getListFromWikiText( 'Wikipédia:Software/Anti-vandal tool/Ortografia' );
	});
}
$(run);

}( jQuery, mediaWiki ) );
export default function() {
	console.count('locationHash.js');
	
	window.addEventListener('hashchange', function(e){
		console.log('hashchange', location.hash, '' === location.hash);
		if ( '' === location.hash ) {
			e.preventDefault();
		}
	}, false);
	
}
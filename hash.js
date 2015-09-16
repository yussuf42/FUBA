var HashService = (function(){
	return{
		createHash: function(title, date){
			hash = title.concat(date);
			return hash;
		}
	}
})();
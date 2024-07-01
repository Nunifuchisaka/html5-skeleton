import $ from 'jquery';
import 'slick-carousel';

export default class Carousel_1 {
	
	#slick;
	#$el;
	#$item;
	#$number;
	#max;
	
	constructor(opts) {
		const self = this;
		this.#$el = $(opts.el);
		console.log("this.#$el", this.#$el);
		
		this.#$item = this.#$el.find(".carousel_1__item");
		this.#max = COMMON.zeroPadding(this.#$item.length,2);
		console.log("this.#max", this.#max);
		
		this.#$number = this.#$el.find(".carousel_1__number");
		this.#$number.text("01 / "+this.#max);
		
		this.#$el.find(".carousel_1__items").slick({
			arrows: true,
			dots: true,
		}).on('beforeChange', function(event, slick, current, next){
				console.log('beforeChange', current, next);
			})
			.on('afterChange', function(event, slick, current){
				console.log('afterChange', current);
				current = COMMON.zeroPadding(++current,2);
				self.#$number.text(current+" / "+self.#max);
			});
	}
	
}
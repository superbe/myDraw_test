/**************************************/
/*                                    */
/*    Графический редактор myDraw.    */
/*       Автор: Бабарыкин Е. П.       */
/*            Октябрь 2020            */
/*                                    */
/**************************************/

// Базовый класс для панелей инструментов.
class doker{
	constructor(class_name, select_class) {
		// В конструктор передаем класс элемента и класс выделения элемента.
		this._class_name = class_name;
		this._select_class = select_class;
		this._init();
	}
	
	_init(){
		// Задаем слушателей на событие клика элементов панели инструментов.
		for (let element of document.getElementsByClassName(this._class_name)) {
			element.addEventListener("click", this._select.bind(this), false);
		}
	}
	
	// Событие клика на элемент панели инструментов.
	_select(event){
		var cleare_elements = document.getElementsByClassName(this._class_name);
		for (let cleare_element of cleare_elements) {
			cleare_element.classList.remove(this._select_class);
		}
		event.target.classList.toggle(this._select_class);
	}
};

// Класс панели инструментов палитры.
class palette extends doker{
	constructor() {
		super('palette', 'div-area-item-color-select')
	}
	
	// Получить выбранный цвет пера.
	get color() {
		return document.getElementsByClassName(this._select_class)[0].attributes['data-color'].value;
	}
};

// Класс панели инструментов размера пера.
class thickness extends doker{
	constructor() {
		super('thickness', 'div-area-item-thickness-select')
	}
	
	// Получить значение выбранного размера пера.
	get value() {
		return parseInt(document.getElementsByClassName(this._select_class)[0].attributes['data-thickness'].value);
	}
};

// Класс координат точки простраства.
class point {
	constructor(x, y) {
		// В конструктор передаются значения координат x и y на координатной плоскости канвы.
		this._x = x;
		this._y = y;
	}

	// Получить значение координаты x.
	get x() {
		return this._x;
	}

	// Задать значение координаты x.
	set x(value) {
		if (value) {
			this._x = value;
		}
	}

	// Получить значение координаты y.
	get y() {
		return this._y;
	}

	// Задать значение координаты y.
	set y(value) {
		if (value) {
			this._y = value;
		}
	}
};


// Класс линии.
class line {
	constructor(id, ctx, color, thickness, line_cap='round', line_join='round') {
		// В конструктор передается уникальный идентификатор линии,
		// контекст канвы, цвет линии, толщина линии и опционально формы заполнения линии.
		this._id = id;
		this._ctx = ctx;
		this._color = color;
		this._thickness = thickness;
		this._line_cap = line_cap;
		this._line_join = line_join;
		this._points = [];
	}
	
	// Добавить точку н алинию.
	add_point(value){
		// В метод передается значение координаты точки
		if (this._points.length > 0){
			this._drawAt(this._points[this._points.length - 1], value);
		}
		this._points.push(value);
	}
	
	// Создать и вернуть новую линию по переданным параметрам.
	static getline(ctx, value) {
		let result = new line(value._id, ctx, value._color, value._thickness, value._line_cap, value._line_join);
		for(let p of value._points){
			result.add_point(p);
		}
		return result;
	}
	
	// Отрисовать текущую точку линии в продолжении предыдущей точки.
	_drawAt(start_point, end_point) {
		// В метод передается начальная и конечная точки отрезка.
        this._ctx.beginPath();
        this._ctx.moveTo(start_point.x, start_point.y);
        this._ctx.lineTo(end_point.x, end_point.y);
        this._ctx.closePath();
        this._ctx.strokeStyle = this._color;
        this._ctx.lineWidth = this._thickness;
        this._ctx.lineCap = this._line_cap;
        this._ctx.lineJoin = this._line_join;
        this._ctx.stroke();
	}
	
	// Отрисовать всю линию.
	draw() {
        for (let i = 1; i < this._points.length; i++) {
			this._drawAt(this._points[i - 1], this._points[i]);
		}
	}
};

// Класс приложения.
class drawingApp {
	constructor() {
		this._palette = new palette();
		this._thickness = new thickness();
        this._canvas = document.getElementById('draw_area');
		this._width = this._canvas.width;
        this._height = this._canvas.height;
		this._canvas.addEventListener('mousedown', this._press.bind(this), false);
		this._canvas.addEventListener('mousemove', this._drag.bind(this), false);
		this._canvas.addEventListener('mouseup', this._release.bind(this), false);
		this._canvas.addEventListener('mouseout', this._cancel.bind(this), false);
		this._shapes = [];
        this._ctx = this._canvas.getContext('2d');
		document.addEventListener('DOMContentLoaded', this._load.bind(this), false);
		document.getElementById('save_button').addEventListener('click', this._save.bind(this), false);
		document.getElementById('clear_button').addEventListener('click', this._clear.bind(this), false);
		window.addEventListener('storage', this._load.bind(this), false);
	}
	
/*
	TODO: Сделать сохранение объектами и отрисовку.
 	_save(event){
		localStorage.setItem('myDraw.shapes', JSON.stringify(this._shapes));
	}
	
	_load(){
		if (localStorage.getItem('myDraw.shapes')) {
			let shapes = JSON.parse(localStorage.getItem('myDraw.shapes'));
			for(let shape of shapes){
				this._shapes.push(line.getline(this._ctx, shape));
			}
		}
	}
 */	
	
	// Созранить рисунок в локальное хранилище.
	_save(event){
		this._ctx.drawImage(this._background, 0, 0, this._width, this._height);
		localStorage.setItem('myDraw.shapes', this._canvas.toDataURL("image/png"));
	}
	
	// Загрузить ранее сохраненный рисунок из локального хранилища.
	_load(){
		if (localStorage.getItem('myDraw.shapes')) {
			this._background = new Image();
			this._background.src = localStorage.getItem('myDraw.shapes');
			document.getElementById('draw_area').style.backgroundImage = "url(" + localStorage.getItem('myDraw.shapes') + ")";
		}
	}
	
	// Очистить канву.
	_clear(){
		this._ctx.clearRect(0, 0, this._width, this._height);
		this._shapes = [];
		this._background = new Image();
		document.getElementById('draw_area').style.backgroundImage = '';
	}

	// Событие нажатия клавиши мыши и начала отрисовки объекта.
	_press(event){
		this._shape_id = +new Date;
		let new_line = new line(this._shape_id, this._ctx, this._palette.color, this._thickness.value);
		new_line.add_point(new point(event.clientX - event.path[1].offsetLeft - event.path[0].offsetLeft, event.clientY - event.path[1].offsetTop - event.path[0].offsetTop));
		this._shapes.push(new_line);
	}
	
	// Событие переноса пера над холстом.
	_drag(event){
		if (this._shape_id) {
			this._shapes[this._shapes.length - 1].add_point(new point(event.clientX - event.path[1].offsetLeft - event.path[0].offsetLeft, event.clientY - event.path[1].offsetTop - event.path[0].offsetTop));
		}
	}
	
	// Освободить текущий объект.
	_release(event){
		this._shape_id = undefined;
	}
	
	// Отмена отрисовки.
	_cancel(event){
		this._shape_id = undefined;
	}
};

/******************************************************************************/
/*                                                                            */
/*                        Графический редактор myDraw.                        */
/*                           Автор: Бабарыкин Е. П.                           */
/*                                Октябрь 2020                                */
/*                                                                            */
/******************************************************************************/

/**
* Интерфейсный класс панели набора (палитры) инструментов.
* 
*/
class doker{
	/**
	* Конструктор.
	* 
	* @param {string} class_name - наименование класса html элемента к 
	* которому будет привязан специализированная палитра инструментов.
	* @param {string} select_class - наименование класса стиля определяющего 
	* выбранный элемент палитры инструментов.
	*/
	constructor(class_name, select_class) {
		this._class_name = class_name;
		this._select_class = select_class;
		this._init();
	}
	
	/**
	* Задать слушателей на событие клика элементов панели инструментов.
	* 
	*/
	_init(){
		for (let element of document.getElementsByClassName(this._class_name)) {
			element.addEventListener("click", this._select.bind(this), false);
		}
	}
	
	/**
	* Обработать событие "клика" на элемент падитры инструментов.
	* 
	* @param {event} event - параметры обрабатываемого события.
	*/
	_select(event){
		var cleare_elements = document.getElementsByClassName(this._class_name);
		for (let cleare_element of cleare_elements) {
			cleare_element.classList.remove(this._select_class);
		}
		event.target.classList.toggle(this._select_class);
	}
};

/**
* Класс панели цветовой палитры.
* 
*/
class palette extends doker{
	/**
	* Конструктор.
	* 
	*/
	constructor() {
		super('palette', 'div-area-item-color-select')
	}
	
	/**
	* Получить выбранный цвет из палитры.
	* 
	* @returns {string} - наименовани выбранного цвета из палитры.
	*/
	get color() {
		return document.getElementsByClassName(this._select_class)[0].attributes['data-color'].value;
	}
};

/**
* Класс панели размера пера.
* 
*/
class thickness extends doker{
	/**
	* Конструктор.
	* 
	*/
	constructor() {
		super('thickness', 'div-area-item-thickness-select')
	}
	
	/**
	* Получить значение выбранного размера пера.
	* 
	* @returns {number} - значение выбранного размера пера.
	*/
	get value() {
		return parseInt(document.getElementsByClassName(this._select_class)[0].attributes['data-thickness'].value);
	}
};

/**
* Класс координат точки простраства.
* 
*/
class point {
	/**
	* Конструктор.
	* 
	* @param {number} x - координата точки по оси ординат на плоскости холста.
	* @param {number} y - координата точки по оси абсцисс на плоскости холста. 
	*/
	constructor(x, y) {
		this._x = x;
		this._y = y;
	}

	/**
	* Получить значение координаты x на плоскости холста.
	* 
	* @returns {number} - значение координаты x.
	*/
	get x() {
		return this._x;
	}

	/**
	* Задать значение координаты x на плоскости холста.
	* 
	* @param {number} value - значение координаты x.
	*/
	set x(value) {
		if (value) {
			this._x = value;
		}
	}

	/**
	* Получить значение координаты y на плоскости холста.
	* 
	* @returns {number} - значение координаты y.
	*/
	get y() {
		return this._y;
	}

	/**
	* Задать значение координаты y на плоскости холста.
	* 
	* @param {number} value - значение координаты y.
	*/
	set y(value) {
		if (value) {
			this._y = value;
		}
	}
};


/**
* Класс примитива "линия".
* 
* TODO: в развитии вынести общий интерфейс (или сделать через обертки) 
* на котором построить другие примитивы: замкнутые линии, кривые Безье и др.
*/
class line {
	/**
	* Конструктор.
	* 
	* @param {number} id - идентификатор линии в общем списке примитивов.
	* @param {CanvasRenderingContext2D} ctx - контекст 2D рендеринга линии 
	* на холсте.
	* @param {string} color - заданный цвет для данной линии.
	* @param {number} thickness - заданная толщина линии. 
	* @param {string} line_cap - заданная форма концов данной линии, 
	* по умолчанию концы линий скругленные "round".
	* @param {string} line_join - заданная форма вершин в которых отрезки 
	* данной линии сходятся, по умолчанию концы линий скругленные "round".
	*/
	constructor(id, ctx, color, thickness, line_cap='round', line_join='round') {
		this._id = id;
		this._ctx = ctx;
		this._color = color;
		this._thickness = thickness;
		this._line_cap = line_cap;
		this._line_join = line_join;
		this._points = [];
	}
	
	/**
	* Добавить начальную точку линии и отрисовть начало линии.
	* 
	* @param {point} value - начальная координатная точка.
	*/
	start_line(value) {
		this._points.push(value);
        this._ctx.strokeStyle = this._color;
        this._ctx.lineWidth = this._thickness;
        this._ctx.lineCap = this._line_cap;
        this._ctx.lineJoin = this._line_join;
        this._ctx.beginPath();
        this._ctx.moveTo(value.x, value.y);
	}
	
	/**
	* Добавить новую точку линии и дорисовать новый отрезок линии.
	* 
	* @param {point} value - новая координатная точка.
	*/
	add_point(value) {
		// В метод передается значение координаты точки
		this._points.push(value);
		if (this._points.length > 0){
			this._ctx.lineTo(value.x, value.y);
			this._ctx.stroke();
		}
	}
	
	/**
	* Создать, отрисовать и вернуть новую линию по переданным параметрам, 
	* загруженных из локального хранилища.
	* 
	* @param {CanvasRenderingContext2D} ctx - контекст 2D рендеринга линии 
	* на холсте.
	* @param {object} value - новая параметры новой линии, загруженные 
	* из локального хранилища.
	*/
	static getline(ctx, value) {
		let result = new line(value._id, ctx, value._color, value._thickness, value._line_cap, value._line_join);
		if (value._points.length > 1){
			result.start_line(new point(value._points[0]._x, value._points[0]._y));
			for (let i = 1; i < value._points.length; i ++) {
				result.add_point(new point(value._points[i]._x, value._points[i]._y));
			}
		}
		return result;
	}
};

/**
* Класс приложения.
* 
*/
class drawingApp {
	/**
	* Конструктор.
	* 
	*/
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
	
	
	/**
	* Обработать событие сохранения рисунка в локальное хранилище.
	* 
	* @param {event} event - параметры обрабатываемого события.
	*/
 	_save(event){
		localStorage.setItem('myDraw.shapes', JSON.stringify(this._shapes));
	}
	
	/**
	* Обработать событие загрузки рисунка из локального хранилища.
	* 
	* @param {event} event - параметры обрабатываемого события.
	*/
	_load(event){
		if (localStorage.getItem('myDraw.shapes')) {
			// TODO: если на одной вкладке почистили холст и сохранили надо ли 
			// на другой вкладке так же все очистить или оставить как есть?
			// Пока на другой вкладке ничего не трогаем.
			let combined_shapes = Array.from(new Set(JSON.parse(localStorage.getItem('myDraw.shapes')).concat(JSON.parse(JSON.stringify(this._shapes)))));
			combined_shapes.sort((a, b) => a._id - b._id);
			this._clear(event);
			for(let shape of combined_shapes){
				if (shape._points.length > 1){
					this._shapes.push(line.getline(this._ctx, shape));
				}
			}
		}
	}

	/**
	* Обработать событие очистки холста изображения.
	* 
	* @param {event} event - параметры обрабатываемого события.
	*/
	_clear(event){
		this._ctx.clearRect(0, 0, this._width, this._height);
		this._shapes = [];
	}

	/**
	* Обработать событие нажатия клавиши мыши и начала отрисовки примитива.
	* 
	* @param {event} event - параметры обрабатываемого события.
	*/
	_press(event){
		this._shape_id = +new Date;
		let new_line = new line(this._shape_id, this._ctx, this._palette.color, this._thickness.value);
		new_line.start_line(new point(event.clientX - event.path[1].offsetLeft - event.path[0].offsetLeft, event.clientY - event.path[1].offsetTop - event.path[0].offsetTop));
		this._shapes.push(new_line);
	}
	
	/**
	* Обработать событие переноса пера над холстом.
	* 
	* @param {event} event - параметры обрабатываемого события.
	*/
	_drag(event){
		if (this._shape_id) {
			this._shapes[this._shapes.length - 1].add_point(new point(event.clientX - event.path[1].offsetLeft - event.path[0].offsetLeft, event.clientY - event.path[1].offsetTop - event.path[0].offsetTop));
		}
	}
	
	/**
	* Обработать событие освобождения текущего объекта.
	* 
	* @param {event} event - параметры обрабатываемого события.
	*/
	_release(event){
		this._shape_id = undefined;
	}
	
	/**
	* Обработать событие отмены отрисовки примитива.
	* 
	* @param {event} event - параметры обрабатываемого события.
	*/
	_cancel(event){
		this._shape_id = undefined;
	}
};

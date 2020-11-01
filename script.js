/* jshint esversion: 6 */

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
class doker {
    /**
    * Конструктор.
    * 
    * @param {string} selector - селектор html элемента к которому будет 
    * привязана специализированная палитра инструментов.
    * @param {string} select_class - наименование класса стиля определяющего 
    * выбранный элемент палитры инструментов.
    */
    constructor(selector, selected_class) {
        this._selector = selector;
        this._selected_class = selected_class;
        this._init();
    }

    /**
    * Задать слушателей на событие клика элементов панели инструментов.
    * 
    */
    _init() {
        const { _selector, _select } = this;
        document.querySelectorAll(_selector)
            .forEach(element => element.addEventListener("click", 
                                                         _select.bind(this), 
                                                         false));
    }

    /**
    * Обработать событие "клика" на элемент падитры инструментов.
    * 
    * @param {event} event - параметры обрабатываемого события.
    */
    _select(event) {
        const { _selector, _selected_class } = this;
        document.querySelectorAll(_selector)
            .forEach(element => element.classList.remove(_selected_class));
        event.target.classList.toggle(_selected_class);
    }
}

/**
* Класс панели цветовой палитры.
* 
*/
class palette extends doker {
    /**
    * Конструктор.
    * 
    */
    constructor() {
        super('.color-palette__item', 
              'color-palette__item_selected');
    }

    /**
    * Получить выбранный цвет из палитры.
    * 
    * @returns {string} - наименовани выбранного цвета из палитры.
    */
    get color() {
        return document.querySelector('.' + this._selected_class)
            .attributes['data-color'].value;
    }
}

/**
* Класс панели размера пера.
* 
*/
class thickness extends doker {
    /**
    * Конструктор.
    * 
    */
    constructor() {
        super('.pen-thickness-palette__item', 
              'pen-thickness-palette__item_selected');
    }

    /**
    * Получить значение выбранного размера пера.
    * 
    * @returns {number} - значение выбранного размера пера.
    */
    get value() {
        return parseInt(document.querySelector('.' + this._selected_class)
            .attributes['data-thickness'].value);
    }
}

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
}

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
        const { _points, _ctx, _color, _thickness, _line_cap, _line_join } = this;
        _points.push(value);
        _ctx.strokeStyle = _color;
        _ctx.lineWidth = _thickness;
        _ctx.lineCap = _line_cap;
        _ctx.lineJoin = _line_join;
        _ctx.beginPath();
        _ctx.moveTo(value.x, value.y);
    }

    /**
    * Добавить новую точку линии и дорисовать новый отрезок линии.
    * 
    * @param {point} value - новая координатная точка.
    */
    add_point(value) {
        const { _points, _ctx } = this;
        _points.push(value);
        if (_points.length > 0){
            _ctx.lineTo(value.x, value.y);
            _ctx.stroke();
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
        let result = new line(value._id, 
                              ctx, 
                              value._color, 
                              value._thickness, 
                              value._line_cap, 
                              value._line_join);
        if (value._points.length > 1){
            result.start_line(new point(value._points[0]._x, value._points[0]._y));
            value._points
                .forEach(_point => result.add_point(new point(_point._x, _point._y)));
        }
        return result;
    }
}

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
        this._canvas = document.querySelector('.draw-area');
        this._width = this._canvas.width;
        this._height = this._canvas.height;
        this._ctx = this._canvas.getContext('2d');
        this._shapes = [];

        this._canvas.addEventListener('mousedown', this._press.bind(this), false);
        this._canvas.addEventListener('mousemove', this._drag.bind(this), false);
        this._canvas.addEventListener('mouseup', this._release.bind(this), false);
        this._canvas.addEventListener('mouseout', this._cancel.bind(this), false);

        document.addEventListener('DOMContentLoaded', this._load.bind(this), false);

        document.querySelector('.button_save')
            .addEventListener('click', this._save.bind(this), false);
        document.querySelector('.button_clear')
            .addEventListener('click', this._clear.bind(this), false);
        window.addEventListener('storage', this._load.bind(this), false);
    }

    /**
    * Обработать событие сохранения рисунка в локальное хранилище.
    * 
    * @param {event} event - параметры обрабатываемого события.
    */
     _save(event) {
        localStorage.setItem('myDraw.shapes', JSON.stringify(this._shapes));
    }

    /**
    * Обработать событие загрузки рисунка из локального хранилища.
    * 
    * @param {event} event - параметры обрабатываемого события.
    */
    _load(event) {
        const value = localStorage.getItem('myDraw.shapes');
        if (value) {
            // TODO: если на одной вкладке почистили холст и сохранили надо ли 
            // на другой вкладке так же все очистить или оставить как есть?
            // Пока на другой вкладке ничего не трогаем.
            let combined_shapes = Array.from(new Set(JSON.parse(localStorage.getItem('myDraw.shapes'))
                                                        .concat(JSON.parse(JSON.stringify(this._shapes)))))
                .filter(shape => shape._points.length > 1);
            combined_shapes.sort((a, b) => a._id - b._id);

            this._clear(event);

            this._shapes = combined_shapes
                .map(shape => line.getline(this._ctx, shape));
        }
    }

    /**
    * Обработать событие очистки холста изображения.
    * 
    * @param {event} event - параметры обрабатываемого события.
    */
    _clear(event) {
        this._ctx.clearRect(0, 0, this._width, this._height);
        this._shapes = [];
    }

    /**
    * Обработать событие нажатия клавиши мыши и начала отрисовки примитива.
    * 
    * @param {event} event - параметры обрабатываемого события.
    */
    _press(event) {
        this._shape_id = +new Date;
        let new_line = new line(this._shape_id, 
                                this._ctx, 
                                this._palette.color, 
                                this._thickness.value);
        new_line.start_line(new point(event.offsetX, event.offsetY));
        this._shapes.push(new_line);
    }

    /**
    * Обработать событие переноса пера над холстом.
    * 
    * @param {event} event - параметры обрабатываемого события.
    */
    _drag(event) {
        if (this._shape_id) {
            this._shapes[this._shapes.length - 1]
                .add_point(new point(event.offsetX, event.offsetY));
        }
    }

    /**
    * Обработать событие освобождения текущего объекта.
    * 
    * @param {event} event - параметры обрабатываемого события.
    */
    _release(event) {
        this._shape_id = undefined;
    }

    /**
    * Обработать событие отмены отрисовки примитива.
    * 
    * @param {event} event - параметры обрабатываемого события.
    */
    _cancel(event) {
        this._shape_id = undefined;
    }
}
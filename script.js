const palette = [
    '#050b09',
    '#66636f',
    '#a698a5',
    '#f1dfe6',
    '#7e121f',
    '#d41b31',
    '#cb43c9',
    '#7e127d',
    '#7c5539',
    '#dc8748',
    '#4880dc',
    '#2b4166',
    '#827611',
    '#d9c51f',
    '#7bd41b',
    '#4c8211'];

function rand(a) {
    return Math.floor(Math.random() * a);
}

function rand_choice(xs) {
    return xs[rand(xs.length)];
}

function minus({x: xa, y: ya}, {x: xb, y: yb}) {
    return {x: xa - xb, y: ya - yb};
}

function plus({x: xa, y: ya}, {x: xb, y: yb}) {
    return {x: xa + xb, y: ya + yb};
}

function mult({x, y}, a) {
    return {x: x * a, y: y * a};
}

function clamp({x, y}) {
    return {x: x | 0, y: y | 0};
}

function pyth({x, y}) {
    return Math.sqrt(x * x + y * y);

}

function dist(pa, pb) {
    return pyth(minus(pa, pb));
}

function dir(pa, pb) {
    return mult(minus(pb, pa), 1 / dist(pb, pa));
}

function in_rect({x: xa, y: ya}, {x: xb, y: yb}, {x: xc, y: yc}) {
    return (xa <= xc && xc < xa + xb &&
            ya <= yc && yc < ya + yb);
}

let data = [];
for (let i = 0; i < 128; i++) {
    let line = [];
    for (let j = 0; j < 128; j++) {
        line.push(rand(2) + 1);
    }
    data.push(line);
} 

let datas = [JSON.parse(JSON.stringify(data))];

let current_color = 0;
let current_size = 2;

let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');

let dcanvas = document.createElement('canvas');
dcanvas.width = 512;
dcanvas.height = 512;
let dctx = dcanvas.getContext('2d');

function draw_data() {
    for (let i = 0; i < 128; i++) {
        for (let j = 0; j < 128; j++) {
            dctx.fillStyle = palette[data[i][j]];
            dctx.fillRect(i * 4, j * 4, 4, 4);
        }
    }
}

draw_data();
draw_dcanvas();

function draw_dcanvas() {
    ctx.drawImage(dcanvas, 0, 0);
}

let oldp = null;

function* blafoo(pfoo) {
    for(let x = 1 - current_size; x < current_size; x++) {
        for(let y = 1 - current_size; y < current_size; y++) {
            let p = plus(pfoo, {x: x, y: y});
            if (in_rect({x: 0, y: 0}, {x: 128, y: 128}, p)) {
                yield p;
            }
        }
    }
}

function draw_dot(pfoo) {
    dctx.fillStyle = palette[current_color];
    for (let p of (blafoo(pfoo))) {
        data[p.x][p.y] = current_color;
        dctx.fillRect(p.x * 4, p.y * 4, 4, 4);
    }
}

function draw_to(p) {
    for (let i = 1; i < dist(oldp, p); i++) {
        draw_dot(clamp(plus(oldp, mult(dir(oldp, p), i))));
    }
    draw_dot(p);
}

function move(mp, draw) {
    let co = {x: canvas.offsetTop, y: canvas.offsetLeft};
    let foo = clamp(mult(minus(mp, co), 1/4));
    if (foo.x < 128 && foo.y < 128) {
        if (draw) {
            draw_to(foo);
            oldp = foo;
        }
        draw_dcanvas();
        ctx.fillStyle = palette[current_color];
        for (let p of blafoo(foo)) {
            ctx.fillRect(p.x * 4, p.y * 4, 4, 4);
        }
    }

}

addEventListener('mousemove', event => {
    let mp = {x: event.clientX, y: event.clientY};
    move(mp, event.buttons === 1);
});

addEventListener('touchmove', event => {
    let touch = event.touches.item(0);
    let mp = {x: touch.clientX, y: touch.clientY};
    move(mp, true);
});

function down(mp) {
    let co = {x: canvas.offsetTop, y: canvas.offsetLeft};
    let foo = clamp(mult(minus(mp, co), 1/4));
    if (foo.x < 128 && foo.y < 128) {
        oldp = foo;
        draw_dot(foo);
        draw_dcanvas();
    }
}

addEventListener('touchstart', event => {
    let touch = event.touches.item(0);
    let mp = {x: touch.clientX, y: touch.clientY};
    down(mp);
});

addEventListener('mousedown', event => {
    let mp = {x: event.clientX, y: event.clientY};
    down(mp);
});

for (let i = 0; i < palette.length; i++) {
    let a = document.createElement('a');
    a.style.backgroundColor = palette[i]
    a.innerText = '. .';
    a.href = 'javascript:';
    a.addEventListener('click', () => {
        current_color = i;
    });
    document.body.insertBefore(a, null);
}

function save() {
    let new_data = JSON.parse(JSON.stringify(rand_choice(datas)));
    datas.push(data);
    data = new_data;
    draw_data();
    draw_dcanvas();
}

const cvs = document.getElementById('mycanvas');
const ctx = cvs.getContext('2d');
let frames = 0;

const sprite = new Image();
sprite.src = 'img/sprite.png';
const au_flap = new Audio();
au_flap.src = 'audio/sfx_flap.wav';
const au_die = new Audio();
au_die.src = 'audio/sfx_die.wav';
const au_hit = new Audio();
au_hit.src = 'audio/sfx_hit.wav';
const au_point = new Audio();
au_point.src = 'audio/sfx_point.wav';
const au_swooshing = new Audio();
au_swooshing.src = 'audio/sfx_swooshing.wav';


const game_over = {
    sX : 175,
    sY : 228,
    w : 225,
    h : 202,
    x : cvs.width/2 - 225/2,
    y : 90,

    start_button: {
        x: 120,
        y: 263,
        w: 83,
        h: 29
    },
    
    draw: function(){
        if(state.current == state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);   
        }
    }
    
}

const get_ready = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.width/2 - 173/2,
    y: 80,

    draw: function(){
        if(state.current == state.get_ready){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        }
    }
}

const bird = {
    animation: [
        {sX: 276, sY: 112},
        {sX: 276, sY: 139},
        {sX: 276, sY: 164},
        {sX: 276, sY: 139}
    ],
    w: 34,
    h: 26,
    x: 50,
    y: 150,
    frame: 0,
    velocity: 0,
    gravity: 0.25,
    jump: 4.6,
    rotation: 0,
    action: 0,
    died: false,
    hit_play: false,

    draw: function(){
        let bird = this.animation[this.frame]

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, - this.w/2, - this.h/2, this.w, this.h)
        ctx.restore();
    },

    flap: function(){
        this.velocity = - this.jump;
        this.y -= this.jump;
        au_flap.play();
    },

    update: function(){
        this.plunge_when_hit_wall();
        this.collision_detection();
        this.score_caculate();

        this.action = this.y;

        if(state.current == state.get_ready){
            this.y = 150;
            this.rotation = 0 * Math.PI/180;
        }
        if(state.current == state.game){
            // make bird flpaping every 8 frame
            if(frames % 6 == 0){
                this.frame++;

                if(this.frame > 3) this.frame = 0
            }


            this.velocity += this.gravity
            this.y += this.velocity

            if(this.y + this.h/2 >= cvs.height - foreground.h){
                this.y = cvs.height - foreground.h - this.h/2;

                if(state.current == state.game){
                    this.velocity = 0;
                    state.current = state.over;
                    au_die.play();
                }
            }

            if(this.velocity >= this.jump && state.current == state.game){
                this.rotation = 90 * Math.PI/180;
                this.frame = 1;
            }
            else if(this.velocity >= this.jump/2 && state.current == state.game){
                this.rotation = 15 * Math.PI/180;
                this.frame = 1;
            }
            else if(state.current == state.game && this.action > this.y){
                this.rotation = - 25 * Math.PI/180;
            }
            else if(state.current == state.game && this.action <= this.y){
                this.rotation =  0 * Math.PI/180;
            }

            // this for smooth play audio when bird plunge
            if(this.velocity >= this. jump + 1) au_swooshing.play();
        }
    },

    collision_detection: function(){
        if(state.current == state.game){
            for(let i = 0; i < pipes.location.length; i++){
                // check collision with top pipe
                if (this.x + this.w/3 > pipes.location[i].x && this.y + this.h > pipes.location[i].top_y && this.x < pipes.location[i].x + pipes.w && this.y < pipes.location[i].top_y + pipes.h + 12) {
                    this.died = true;
                }
                // check collision with bottom pipe
                if (this.x + this.w/3 > pipes.location[i].x && this.y + this.h-10 > pipes.location[i].bottom_y && this.x < pipes.location[i].x + pipes.w && this.y < pipes.location[i].bottom_y + pipes.h) {
                    this.died = true;
                }
            }
        }
    },

    plunge_when_hit_wall: function(){
        if(this.died){
            pipes.dx = pipes.min_dx;
            state.current = state.over;

            this.velocity += this.gravity
            this.y += this.velocity;

            if(!this.hit_play){
                au_hit.play();
                this.hit_play = true;
            }

            if(this.velocity >= this. jump + 1) au_swooshing.play();

            if(this.velocity >= this.jump){
                this.rotation = 90 * Math.PI/180;
                this.frame = 1;
            }

            if(this.y + this.h/2 >= cvs.height - foreground.h){
                this.y = cvs.height - foreground.h - this.h/2;

                au_die.play();
                this.died = false;
                this.velocity = 0;
                this.hit_play = false;
            }
        }
    },

    score_caculate: function(){
        for(let i = 0; i < pipes.location.length; i++){
            if(pipes.location[i].x + pipes.w < this.x && !pipes.location[i].get_score){
                pipes.location[i].get_score = true;
                scores.new_score();
                au_point.play();
            }
        }
    }
}

const pipes = {
    bottom: {
        sX: 502,
        sY: 0,
        y: 0,
    },
    top: {
        sX: 553,
        sY: 0,
        y: 0,
    },
    x: cvs.width,
    w: 52,
    h: 400,

    col_top_h: 80,
    min_h: 30,
    max_h: 260,

    gap: 90,
    min_gap: 80,
    max_gap: 150,

    location: [],

    dx: 1.1,
    min_dx: 1.1,
    max_dx: 2.2,

    draw: function(){
        for(let i = 0; i < this.location.length; i++){
            if(state.current == state.game){
                this.location[i].x -= this.dx;
            }

            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, this.location[i].x, this.location[i].top_y, this.w, this.h);
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, this.location[i].x, this.location[i].bottom_y, this.w, this.h);
        
            
            // kiểm tra xem nếu có đường ống nào đi đến nửa màn hình thì sẽ tạo đường ống tiếp theo
            // check là đường ống mới chỉ được tạo 1 lần khi đường ống cũ đi qua nửa màn hình
            // nếu không có check thì sau khi đi qua nửa màn hình nó sẽ liên tục tạo đường ống mới
            if(this.location[i].x <= cvs.width/2 && this.location[i].check == false){
                this.generate_pipe();
                this.location[i].check = true;
            }
        }

        // remove when pipes overflow the game
        if(this.location[0].x < 0 - this.w){
            this.location.shift();
        }
    },

    generate_pipe: function(){
        // random gap between 2 pipe(min gap 80, max gap 150)
        this.gap = Math.floor(Math.random() * (this.max_gap - this.min_gap) + this.min_gap);
        // random height of pipe top( height between 30 and 260)
        this.col_top_h = Math.floor(Math.random() * (this.max_h - this.min_h) + this.min_h);

        // caculate how many pixels of pipe top showed
        this.top.y = - (this.h - this.col_top_h);
        // then show bottom pipe follow height of pipe top
        this.bottom.y = this.col_top_h + this.gap;


        this.location.push({
            x: cvs.width, 
            top_y: this.top.y,
            bottom_y: this.bottom.y,
            check: false,
            get_score: false
        })
    },

    update: function(){
        // generate pipe when load game
        if(frames == 0) this.generate_pipe()
    },


}

const scores = {
    best: parseInt(localStorage.getItem('best') || 0),
    value: 0,

    draw: function(){
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';

        if(state.current == state.game){
            ctx.lineWidth = 2;
            ctx.font = '35px Teko';
            ctx.fillText(this.value, cvs.width/2, 50);
            ctx.strokeText(this.value, cvs.width/2, 50);
        }
        else if(state.current == state.over){
            ctx.font = '35px Teko';
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },

    update: function(){
        if(state.current == state.get_ready){
            this.value = 0;
        }
    },

    new_score: function(){
        this.value += 1;

        if(state.current == state.game){
            this.best = (this.best > this.value) ? this.best : this.value;

            localStorage.setItem('best', this.best);
        }
        
        // increased difficulty for game 
        if(pipes.dx < pipes.max_dx){
            pipes.dx += 0.03;
        }
    }
}


// game state
const state = {
    current: 0,
    get_ready: 0,
    game: 1,
    over: 2
}

document.addEventListener('keydown', (e) => {
    if (e.code === "Space") {
        if(state.current == state.game){
            bird.flap();
        }

        if(state.current == state.get_ready){
            state.current = state.game;
        }

        if(state.current == state.over){
            state.current = state.get_ready;

            // remove pipes when user click when game over
            pipes.location = [];
            // generate pipe when new game 
            pipes.generate_pipe();
        }
    }
});

// control the game
cvs.addEventListener("click", function(event){
    switch (state.current) {
        case state.get_ready:
            state.current = state.game;
            break;
    
        case state.game:
            bird.flap();
            break;

        case state.over:
            let rect = cvs.getBoundingClientRect();

            let click_x = event.clientX - rect.left;
            let click_y = event.clientY - rect.top;

            if(click_x > game_over.start_button.x && click_x < game_over.start_button.x + game_over.start_button.w && click_y > game_over.start_button.y && click_y < game_over.start_button.y + game_over.start_button.h){
                state.current = state.get_ready;

                // remove pipes when user click when game over
                pipes.location = [];
                // generate pipe when new game 
                pipes.generate_pipe();
            }
            
            break;
    }
})

const background = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 225,
    x: 0,
    y: cvs.height - 225,
    draw: function(){
        // image, dx, dy, dwith, dheight vị trí muốn hiển thị ành tiếp đó là  dx, dy, dwith, dheight muốn hiển thị từ ảnh( cắt từ ảnh)
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    }
}

const foreground = {
    sX: 277,
    sY: 0,
    w: 223,
    h: 111,
    x: 0,
    y: cvs.height - 111,
    dx: 2,

    draw: function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    },

    update: function(){
        if(state.current == state.game){
            this.x = (this.x - this.dx) % (this.w/2);
        }
    }
}

function draw() {
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0,0, cvs.width, cvs.height);

    get_ready.draw();
    background.draw();
    foreground.draw();
    bird.draw();
    pipes.draw();
    game_over.draw();
    scores.draw();
}

function update() {
    foreground.update();
    bird.update();
    pipes.update();
    scores.update();
}


function loop() {
    update();
    draw();

    frames++;
    if(frames == 10000000) frames = 0;

    requestAnimationFrame(loop);
}

loop();
var windVelocity = 1.0;

var mouseX, mouseY, mouseDown;

var dirtyLeft = 0;
var dirtyTop = 0;
var dirtyRight = 900;
var dirtyBottom = 488;

function ParticleEmitter( CANVAS_WIDTH, CANVAS_HEIGHT, M_ALPHA, F_ALPHA)
{
  this.m_x;
  this.m_y;
  this.CANVAS_WIDTH = CANVAS_WIDTH;
  this.CANVAS_HEIGHT = CANVAS_HEIGHT;
  this.m_dieRate;
  this.f_dieRate;
  this.m_image;
  this.m_speed = 0.02*Math.random();
  this.m_alpha = M_ALPHA;
  this.f_alpha = F_ALPHA;
  // this.m_alpha = Math.random()*0.2;
  // this.f_alpha = Math.random()*0.05;
  this.m_listParticle = [];
  this.init = function(particles, imageSmoke, imageFire, event)
  {
        if(event){
            this.m_x = event.offsetX;
            this.m_y = event.offsetY;
        } else {
            this.m_x = mouseX;
            this.m_y = mouseY;
        }

        // the effect is positioned relative to the width and height of the canvas
        this.m_image = imageSmoke;
        this.f_image = imageFire;

        this.m_dieRate = 0.01;
        this.f_dieRate = 100;

        var that = this;
        var time = 0;

        // start with smoke already in place
        for (var n = 0; n < particles; n++)
        {
            var counter = 0;
            setTimeout(
                function(){
                    that.m_listParticle.push(new SmokeParticle());
                    that.m_listParticle[counter++].init(that, 1);
                }, time);
            time += 100;
        }
  };
  this.update = function(timeElapsed, windVelocity)
  {
        for (var n = 0; n < this.m_listParticle.length; n++)
        {
            this.m_listParticle[n].update(timeElapsed, windVelocity);
        }
  };
  this.render = function(context)
  {     
        for (var n = 0; n < this.m_listParticle.length; n++)
        {
            this.m_listParticle[n].render(context);
        }
  };
}
function FireParticle( x, y, rad, blasted, object_height) {
    this.x=x;
    this.y=y;
    this.rad = blasted ? object_height/5 : rad;
    this.life = blasted ? 0.011 : this.rad/7;
    this.blasted = blasted;
}
function SmokeParticle()
{
    this.m_;
    this.m_y;
    this.m_age;
    this.m_xVector;
    this.m_yVector;
    this.m_scale;
    this.m_alpha;
    this.f_alpha;
    this.m_canRegen;
    this.f_canRegen;
    this.m_timeDie;
    this.m_emitter;

    this.init = function(emitter, age)
    {
        this.m_age = age;
        this.m_emitter = emitter;
        this.m_canRegen = true;
        this.f_canRegen = true;
        this.startRand();
    };

    this.isAlive = function () 
    {
        return this.m_age < this.m_timeDie;
    };

    this.startRand = function()
    {
        // smoke rises and spreads
        this.m_xVector = Math.random()*0.5 - 0.25;
        this.m_yVector = -1.5 - Math.random();

        this.m_timeDie = 20000 + Math.floor(Math.random()*12000);

        var invDist = 1.0/Math.sqrt(this.m_xVector*this.m_xVector + this.m_yVector*this.m_yVector);

        // normalize speed 
        this.m_xVector = this.m_xVector*invDist*this.m_emitter.m_speed;
        this.m_yVector = this.m_yVector*invDist*this.m_emitter.m_speed;

        // starting position within a 20 pixel area 
        this.m_x = (this.m_emitter.m_x + Math.floor(Math.random()*20)-10);
        this.m_y = (this.m_emitter.m_y + Math.floor(Math.random()*20)-10);

        // the initial age may be > 0. This is so there is already a smoke trail in 
        // place at the start
        this.m_x += (this.m_xVector+windVelocity)*this.m_age;
        this.m_y += this.m_yVector*this.m_age;
        this.m_scale = 0.01;
        this.m_alpha = this.f_alpha = 0.0;
    };

    this.update = function(timeElapsed, windVelocity)
    {
        this.m_age += timeElapsed;
        if (!this.isAlive()) 
        {
            // fire eventually dies
            if (Math.random() > this.m_emitter.f_dieRate)
            {   
                this.f_canRegen = false;
            }

            // smoke eventually dies
            if (Math.random() > this.m_emitter.m_dieRate)
            {
                this.m_canRegen = false;
            }

            if (!this.m_canRegen)
            {
                return;     
            }

            // regenerate
            this.m_age = 0;
            this.startRand();
            return;
        }
        // At start the particle fades in and expands rapidly (like in real life)
        var fadeIn = this.m_timeDie * 0.05;
        var startScale;
        var maxStartScale = 0.05;

        if (this.m_age < fadeIn)
        {
            this.f_alpha = this.f_canRegen ? this.m_age/fadeIn : 0; 
            this.m_alpha = this.m_age/fadeIn;

            startScale = this.m_alpha*maxStartScale;
            this.m_y += this.m_yVector*2.0*timeElapsed;
        }
        else
        {
            this.f_alpha = this.f_canRegen ? (1.0 - (this.m_age-fadeIn)/(this.m_timeDie-fadeIn)) : 0;
            this.m_alpha = 1.0 - (this.m_age-fadeIn)/(this.m_timeDie-fadeIn);
            startScale = maxStartScale;
            this.m_y += this.m_yVector*timeElapsed;
        }
        // the x direction is influenced by wind velocity
        this.m_x += (this.m_xVector+windVelocity)*timeElapsed;

        this.m_alpha *= this.m_emitter.m_alpha;
        this.f_alpha *= this.m_emitter.f_alpha;

        this.m_scale = 0.001 + startScale + this.m_age/4000.0;
    };

    this.render = function(ctx)
    {
        if ( !this.isAlive() ) return;

        var height = this.m_emitter.m_image.height*this.m_scale;
        var width = this.m_emitter.m_image.width*this.m_scale;

        // round it to a integer to prevent sub-pixel positioning
        var x = Math.round( this.m_x - width/2 );
        var y = Math.round( this.m_y + height/2 );

        ctx.globalAlpha = this.f_alpha;
        if( this.f_canRegen ) { ctx.drawImage(this.m_emitter.f_image, x, y, width/2, height/2);}

        ctx.globalAlpha = this.m_alpha;
        ctx.drawImage(this.m_emitter.m_image, x, y, width, height);

        if (x < dirtyLeft)
        {
            dirtyLeft = x;
        }
        if (x+width > dirtyRight)
        {
            dirtyRight = x+width;
        }
        if (y < dirtyTop)
        {
            dirtyTop = y;
        }
        if (y+height > dirtyBottom)
        {
            dirtyBottom = y+height;
        }
    };
}
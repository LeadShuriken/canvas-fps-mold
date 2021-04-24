var TankHandling = function( walk_sprite, strike_sprites, turn_sprite, tank_dead, tank_shooting, speed, direction, pos_x, pos_y, health, power, id_data)
{
    var that = this;

    this.placement_array = [];

    this.pos_x = pos_x;
    this.pos_y = pos_y;

    this.sprite_width = 75;
    this.sprite_height = 62;
    
    this._height = 62;
    this._width = 75;

    this.once = false;
    this._index = 0;

    this.speed = speed;
    this.direction = direction;
    this.health = health;
    this.state = "walking";

    this.depth_factor = undefined;

    this.stop_movement = false;
    this.stop_updating = false;
    this.current_sprite = undefined;
    
    this.strike_sprites = strike_sprites;
    this.tank_shooting = resources.get(tank_shooting);
    this.turn_sprite = resources.get(turn_sprite);
    this.walk_sprite = resources.get(walk_sprite);
    this.dead_sprite = resources.get(tank_dead);

    (function init(){
        that.current_sprite = that.walk_sprite;

        that.pos_x = that.pos_X < ( that._width + that.speed*2 ) ? (that._width + that.speed*2) : that.pos_X;  
        that.pos_x = that.pos_X > ( 900 - ( that._width + that.speed*2 ) ) ? ( 900 - ( that._width + that.speed*2 ) ) : that.pos_X;

        that.pos_y = that.pos_y < ( that._height + that.speed*2 ) ? ( that._height + that.speed*2) : that.pos_y;
        that.pos_y = that.pos_y > ( 488 - ( that._height + that.speed*2 ) ) ? ( 488 - ( that._height + that.speed*2 ) ) : that.pos_y;

        var color = [
            (id_data[1].data[((that.pos_y*(id_data[1].width*4)) + (that.pos_x*4))]),
            (id_data[1].data[((that.pos_y*(id_data[1].width*4)) + (that.pos_x*4)) + 1]),
            (id_data[1].data[((that.pos_y*(id_data[1].width*4)) + (that.pos_x*4)) + 2])
        ];

        while ( color[0] !== 254 ) {
            var random_x = Math.floor(Math.random()*900);
            var random_y = Math.floor(Math.random()*488);

            that.pos_x = random_x < ( that._width + that.speed*2 ) ? (that._width + that.speed*2 ) : random_x;  
            that.pos_x = random_x > ( 900 - ( that._width + that.speed*2 ) ) ? ( 900 - ( that._width + that.speed*2 ) ) : random_x;

            that.pos_y = random_y < ( that._height + that.speed*2 ) ? ( that._height + that.speed ) : random_y;
            that.pos_y = random_y > ( 488 - ( that._height + that.speed*2 ) ) ? ( 488 - ( that._height + that.speed*2 ) ) : random_y;

            var color = [
                (id_data[1].data[((that.pos_y*(id_data[1].width*4)) + (that.pos_x*4))]),
                (id_data[1].data[((that.pos_y*(id_data[1].width*4)) + (that.pos_x*4)) + 1]),
                (id_data[1].data[((that.pos_y*(id_data[1].width*4)) + (that.pos_x*4)) + 2])
            ];
        }

        that.depth_factor = (id_data[0].data[((that.pos_y*(id_data[0].width*4)) + (that.pos_x*4))])/255;

        that._width = Math.round(that.sprite_width*that.depth_factor);
        that._height = Math.round(that.sprite_height*that.depth_factor);
    })();

    this.change_direction = function(){
        that.state = "turning";
        that.stop_movement = true;
        that.current_sprite = that.turn_sprite;
        that._index = 0;
        that.once = true;
    };

    this.shoot = function(){
        that.state = "shooting";
        that.current_sprite = that.tank_shooting;
        that._index = 0;
        that.once = true;
    };

    this.got_hit = function(){
        that.state = "hit";
        that.current_sprite = that.strike_sprites[Math.floor(Math.random()*(that.strike_sprites.length))];
        that.once = true;
    };

    this.justDied = function(){
        that.state = "dead";
        that.current_sprite = that.dead_sprite;
        that.once = true;
    };

    this.update_movement = function(factor){
        if( isNaN(factor) ){ return; }

        var index = id_data[1].data[ (that.pos_y + that._height)*(id_data[1].width*4) + ((that.pos_x+(that._width*Math.acos(that.direction*-1)/Math.PI))*4)];

        if( ( this.pos_x + this._width + this.speed ) > 900 || ( this.pos_x < this.speed ) || ( index !== 254 ) ){
            if( this.once || this.change_direction() );
            this._index += this.speed*factor;
        } else {
            this._index += this.speed*factor;
            if( !this.once && !this.stop_movement) {
                this.pos_x += Math.round((this.direction*this.speed)*(that.depth_factor));
            }
            that.placement_array = [ that.pos_x,
                                     that.pos_y,
                                     that._width,
                                     that._height ];
        }
    };

    this.render = function(context){

        if( that.current_sprite === undefined ){ return; }

        if(!that.once) {

            var max = (that.current_sprite.width/2)/that.sprite_width;
            var idx = Math.floor(that._index);
            frame = idx % max;

            if ( idx >= max ) {
                that._index = 0;
                frame = 0;
            }

            context.drawImage( that.current_sprite, ( that.current_sprite.width/2 - (that.sprite_width*Math.acos(that.direction)/Math.PI) + that.sprite_width*frame*that.direction ), 0, that.sprite_width, that.sprite_height, 0, 0, that._width, that._height );

            context.beginPath();
            context.closePath();
            context.fill();

        } else {
            
            var max = (that.current_sprite.width/2)/that.sprite_width;
            var idx = Math.floor(that._index);
            frame = idx % max;

            if ( idx >= max ) {
                switch (that.state) {

                    case "turning":
                        that.current_sprite = that.walk_sprite;
                        that.state = "walking";
                        that.direction *= -1;
                        that.pos_x = that.pos_x + that.speed*that.direction;
                        that.once = false;
                        that.stop_movement = false;
                        break;
                    case "shooting":
                        that.current_sprite = that.walk_sprite;
                        that.state = "walking";
                        that.direction *= -1;
                        that.once = false;
                        playerGotHit(power);
                        break;
                    case "dead":
                        that.stop_updating = true;
                        break;
                    case "hit":
                        that.current_sprite = that.walk_sprite;
                        that.state = "walking";
                        that.once = false;
                        break;
                    default:
                        break;

                }
                that._index = 0;
            }

            if(that.stop_updating){
                context.drawImage( that.current_sprite, ( that.current_sprite.width/2 - (that.sprite_width*Math.acos(that.direction)/Math.PI)  +  that.sprite_width*(max - 1)*that.direction ), 0, that.sprite_width, that.sprite_height, 0, 0, that._width, that._height );
            } else {
                context.drawImage( that.current_sprite, ( that.current_sprite.width/2 - (that.sprite_width*Math.acos(that.direction)/Math.PI)  +  that.sprite_width*frame*that.direction ), 0, that.sprite_width, that.sprite_height, 0, 0, that._width, that._height);
            }
        }
    };
};
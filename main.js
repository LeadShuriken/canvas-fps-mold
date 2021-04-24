
    // A cross-browser requestAnimationFrame
    // See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
    var requestAnimFrame = (function(){
        return window.requestAnimationFrame    ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            };
    })();

    var game_going = true;

    // ---------------- //
    //   DOM ELEMENTS   //
    // ---------------- //

    var termometer_numbers = document.getElementById("termometer_numbers");
    var shooting_hand = document.getElementById("gun_placement");
    var flash_holder = document.getElementById("flash_placement");
    var flash_cutter = document.getElementById("flash-cutter");

    // --------------- //
    //  GAME HANDLERS  //
    // --------------- //

    var cover_element = document.getElementById("gun_em");
    var end_game = document.getElementById("end_game");
    var game_handler = document.getElementById("game_handler");

    var canvas = document.getElementById("canvas");
    var canvas_1 = document.getElementById("canvas_1");
    var canvas_2 = document.getElementById("canvas_2");
    var trigger = document.getElementById("trigger_canvas");

    var ctx = canvas.getContext("2d");
    var ctx_1 = canvas_1.getContext("2d");
    var ctx_2 = canvas_2.getContext("2d");
    var trigger_ctx = trigger.getContext("2d");

    trigger_ctx.imageSmoothingEnabled = true;
    trigger_ctx.mozImageSmoothingEnabled = true;
    trigger_ctx.webkitImageSmoothingEnabled = true;
    trigger_ctx.msImageSmoothingEnabled = true;

    canvas.width = canvas_1.width = canvas_2.width = W = 900;
    canvas.height = canvas_1.height = canvas_2.height = H = 488;
    trigger.width = 100;
    trigger.height = 100;

    trigger.style.borderRadius = trigger.width + "px";

    var player_health = 200;
    var reshootHeater = 100;
    var reshootCooldown = undefined;

    // -------------------- //
    //   Particle Effects   //
    // -------------------- //

    var lastRender = new Date().getTime();
    var previousEvent = false;
    var dataURL = [null, null];

    var gun_speed = 0;
    var do_mag = true;
    var magnification = 1.5;

    // --------------------- //
    //   SPRITE/IMG ARRAYS   //
    // --------------------- //

    var Tanks_Holder = [];
    var SmokeArray = [];
    var HitArray = [];

    // ------------------------ //
    //    MISC IMAGE INIT       //
    // ------------------------ //

    var imgBulletStrike = 'img/misc/bullet_strike.png';
    var imgBulletHole = 'img/misc/bullet_hole.png';
    var imgSmoke = 'img/misc/puffBlack.png';
    var imgFire = 'img/misc/fireBall.png';

    // ------------------------ //
    //    WEAPONS IMAGE INIT    //
    // ------------------------ //

    var flash_array = [ "img/gun_elements/machine_gun/flash-gun-animation-1.png",
                        "img/gun_elements/machine_gun/flash-gun-animation-2.png",
                        "img/gun_elements/machine_gun/flash-gun-animation-3.png",
                        "img/gun_elements/machine_gun/flash-gun-animation-4.png",
                        "img/gun_elements/machine_gun/flash-gun-animation-5.png" ];
    
    var machine_gun = "img/gun_elements/machine_gun/sprite-gun-animation.png";

    // ------------------------ //
    //    SCENE IMAGE INIT      //
    // ------------------------ //

    // var Background_RGB = 'img/scene_elements/scene_1/background.jpg';
    // var Background_Depth = 'img/scene_elements/scene_1/background_z.jpg';

    var Background_RGB = 'img/scene_elements/scene_2/background.jpg';
    var Background_Depth = 'img/scene_elements/scene_2/background_z.jpg';
    var Background_ID = 'img/scene_elements/scene_2/background_id.jpg';

    // ------------------------ //
    //    ENEMY IMAGE INIT      //
    // ------------------------ //

    // TANK //

    var strike_sprites = [ "img/enemy_elements/tank/tank_strike_1.png",
                           "img/enemy_elements/tank/tank_strike_2.png",
                           "img/enemy_elements/tank/tank_strike_3.png" ];

    var tank_shooting = "img/enemy_elements/tank/tank_shooting.png";
    var tank_turning = "img/enemy_elements/tank/tank_turning.png";
    var tank_walking = "img/enemy_elements/tank/tank_walking.png";
    var tank_dead = "img/enemy_elements/tank/tank_dead.png";

    // ------------------------//

    resources.load([
        strike_sprites,
        flash_array,
        machine_gun,

        tank_walking,
        tank_turning,
        tank_dead,
        tank_shooting,

        Background_RGB,
        Background_Depth,
        Background_ID,

        imgBulletStrike,
        imgBulletHole,
        imgSmoke,
        imgFire,
    ]);

    resources.onReady(init);

    // --------------------- //
    //   PLayer Handling     //
    // --------------------- //

    function playerGotHit(power){
        player_health -= power;
        var shake_time = 0;
        for (var i = 0; i < 6; i++)
        {
            var counter = 0;
            setTimeout(
                function(){
                    if(counter === 5){
                        cover_element.style.left = "10px";
                    } else {
                        cover_element.style.left = ( Math.floor( Math.random()*12 + 8) ).toString() + "px";
                        counter++;
                    }
                } , shake_time );
            shake_time += 50/power;
        }
        if(player_health <= 0){
            game_going = false;
            end_game.style.opacity = "1";
            game_handler.style.display = "none";
        }
    }

    window.playerGotHit = playerGotHit;

    // -------------- //
    //   MAIN & INIT  //
    // -------------- //

    function init()
    {
        // get absolute position of background image
        var xImage = ctx.offsetLeft;
        var yImage = ctx.offsetTop;
        var elem = ctx.offsetParent;

        shooting_hand.style.backgroundImage = "url(" +  resources.get(machine_gun).src + ")";

        while (elem)
        {
            xImage += elem.offsetLeft;
            yImage += elem.offsetTop;
            elem = elem.offsetParent;
        }

        for (var i = 0; i < strike_sprites.length; i++) {
            strike_sprites[i] = resources.get(strike_sprites[i]);
        }

        Background_Depth = resources.get(Background_Depth);
        Background_RGB = resources.get(Background_RGB);
        Background_ID = resources.get(Background_ID);

        imgBulletStrike = resources.get(imgBulletStrike);
        imgBulletHole = resources.get(imgBulletHole);
        imgSmoke = resources.get(imgSmoke);
        imgFire = resources.get(imgFire);
        
        // -------------------------------------------- //
        // Background_Depth.crossOrigin = 'Anonymous';  //
        // Background_ID.crossOrigin = 'Anonymous';     //
        // -------------------------------------------- //

        ctx_1.drawImage(Background_Depth, 0, 0);
        dataURL[0] = ctx_1.getImageData(0, 0, Background_Depth.width, Background_Depth.height);
        ctx_1.clearRect(0, 0, Background_Depth.width, Background_Depth.height);
        
        ctx_1.drawImage(Background_ID, 0, 0);
        dataURL[1] = ctx_1.getImageData(0, 0, Background_ID.width, Background_ID.height);
        ctx_1.clearRect(0, 0, Background_ID.width, Background_ID.height);
    
        Tanks_Holder.push( new TankHandling( tank_walking, strike_sprites, tank_turning, tank_dead, tank_shooting, 1, -1, 100, 100, 1, Math.floor(Math.random()*10 + 1), dataURL) );

        addEvent(game_handler ,"mousemove", function(event) {
            gun_look_at(event, shooting_hand , flash_cutter);

            mouseX = event.layerX;
            mouseY = event.layerY;

            trigger.style.left = (mouseX - trigger.width/2) + "px";             
            trigger.style.top = (mouseY - trigger.height/2) + "px";

            event.time = Date.now();
            var res;
            res = makeVelocityCalculator( event, previousEvent);
            previousEvent = event;
            gun_speed = res;

     
        });

        addEvent(game_handler,"mousedown", function(event){

            // var factor_id = [null,null,null];
            // factor_id[0] = (dataURL[1].data[((mouseY*(dataURL[1].width*4)) + (mouseX*4))]);     
            // factor_id[1] = (dataURL[1].data[((mouseY*(dataURL[1].width*4)) + (mouseX*4)) + 1]);        
            // factor_id[2] = (dataURL[1].data[((mouseY*(dataURL[1].width*4)) + (mouseX*4)) + 2]);
            // console.log([factor_id[0], mouseX, mouseY]);

            mouseDown = true;
            shootHandling(event,
                 flash_holder,
                 flash_array,
                 gun_speed,
                 dataURL,
                 Tanks_Holder,
                 shooting_hand,
                 [HitArray, SmokeArray],
                 [imgSmoke , imgFire] );
        });

        addEvent(game_handler, "mouseup", function(){
            mouseDown = false;
            if (!reshootCooldown) {
                reshootCooldown = setInterval( FnReshootCooldown, 100); 
            }
        });

        addEvent(game_handler, "mouseleave", function(){
            mouseDown = false;
            if (!reshootCooldown) {
                reshootCooldown = setInterval( FnReshootCooldown , 100); 
            }
        });

        addEvent(document,"keydown", press );
        addEvent(document,"keyup", release );

        main();
    }

    var gameTime = 0;
    function update(dt) {
        if(isNaN(dt)){ return; }
        gameTime += dt;

        // It gets harder over time by adding enemies using this
        // equation: 1-.993^gameTime

        // Enemies Shoot //
        if( (Math.random() + 0.1) < (1 - Math.pow(0.993, gameTime)) ) {
            var chosen_tank = Tanks_Holder[Math.floor(Math.random()*Tanks_Holder.length)];
            if( chosen_tank ){ if(chosen_tank.once || chosen_tank.shoot()); }
        }

        if( game_going ){
            // Enemies Spawn //
            if( (Math.random() + 0.2) < (1 - Math.pow( 0.993, gameTime)) ) {

                gameTime = gameTime > 20 ? 0 : gameTime;
                var direction = Math.random() < 0.5 ? -1 : 1;

                Tanks_Holder.push( new TankHandling( tank_walking, strike_sprites, tank_turning, tank_dead, tank_shooting, 1, direction, 100, 100, 1, Math.floor(Math.random()*10 + 1), dataURL) );
                Tanks_Holder.sort(function(a, b) {
                    return parseFloat(a._width) - parseFloat(b._width);
                });
            }
        }

        for (var i = 0; i < Tanks_Holder.length; i++) {
            if ( Tanks_Holder[i].stop_updating || Tanks_Holder[i].update_movement(dt) );
        }
    }

    var lastTime;
    function main() {
        var now = Date.now();
        var dt = (now - lastTime) / 100.0;

        update(dt);
        render(ctx_2);

        lastTime = now;
        requestAnimFrame(main);
    }
    
    function render(context) {
        context.clearRect( 0, 0, W, H);
        context.drawImage( Background_RGB ,0 ,0 );

        for(var i=0; i<Tanks_Holder.length; i++) {
            renderEntity(Tanks_Holder[i]);
        }

        if(do_mag){
            trigger.style.display = "";
            var magnification_x = Math.abs(mouseX - trigger.width/(magnification*2)); 
            var magnification_y = Math.abs(mouseY - trigger.height/(magnification*2));

            trigger_ctx.drawImage(canvas_2,
                          magnification_x,
                          magnification_y,
                          trigger.width/magnification, trigger.height/magnification,
                          0, 0,
                          trigger.width, trigger.height);

            trigger_ctx.drawImage(canvas_1,
                          magnification_x,
                          magnification_y,
                          trigger.width/magnification, trigger.height/magnification,
                          0, 0,
                          trigger.width, trigger.height);

            trigger_ctx.drawImage(canvas,
                          magnification_x,
                          magnification_y,
                          trigger.width/magnification, trigger.height/magnification,
                          0, 0,
                          trigger.width, trigger.height);

            trigger_ctx.strokeStyle = "black";
            trigger_ctx.lineWidth = 5;
            
            trigger_ctx.beginPath();
            trigger_ctx.arc(trigger.width/2,trigger.height/2,(trigger.width/2-trigger_ctx.lineWidth/2 + 1),0,2*Math.PI);
            trigger_ctx.stroke();

            // trigger_ctx.moveTo();
            
        } else {
            trigger.style.display = "none";
            trigger_ctx.clearRect( 0, 0, trigger.width, trigger.height);
        }
    }

    function renderEntity(entity) {
        ctx_2.save();
        ctx_2.translate(entity.pos_x, entity.pos_y);
        entity.render(ctx_2);
        ctx_2.restore();
    }

    function render_particles() 
    {
        // time in milliseconds
        var timeElapsed = new Date().getTime() - lastRender;
        var used_sprite;
        var alpha;
        var strike_size;

        lastRender = new Date().getTime();

        ctx.clearRect( dirtyLeft, dirtyTop, dirtyRight - dirtyLeft, dirtyBottom - dirtyTop );

        dirtyLeft = 1000;
        dirtyTop = 1000;

        dirtyRight = 0;
        dirtyBottom = 0;

        windVelocity += (Math.random()-0.5)*0.002;
        if (windVelocity > 0.015)
        {
            windVelocity = 0.015;
        }
        if (windVelocity < 0.0)
        {
            windVelocity = 0.0;
        }

        if(SmokeArray.length > 0) {
            for (var i = 0; i < SmokeArray.length; i++)
            {
                SmokeArray[i].update(timeElapsed, windVelocity);
                SmokeArray[i].render(ctx);
            }
        }

        if ( HitArray.length > 0 ) {
            for (var i = 0; i < HitArray.length; i++)
            {   
                if ( HitArray[i].life < 0.01 ) 
                {
                    
                    ctx_1.clearRect(HitArray[i].x - HitArray[i].rad/2, HitArray[i].y - HitArray[i].rad/2, HitArray[i].rad, HitArray[i].rad);
                    HitArray.splice(i, 1);

                } else {

                    if ( HitArray[i].blasted ){
                        used_sprite = imgBulletStrike;
                        alpha = 1;
                    } else {
                        used_sprite = imgBulletHole;
                        alpha = HitArray[i].life;
                    }

                    ctx_1.clearRect(HitArray[i].x - HitArray[i].rad/2, HitArray[i].y - HitArray[i].rad/2, HitArray[i].rad, HitArray[i].rad);
                    ctx_1.globalAlpha = alpha;

                    ctx_1.drawImage(used_sprite, HitArray[i].x - HitArray[i].rad/2, HitArray[i].y - HitArray[i].rad/2, HitArray[i].rad, HitArray[i].rad);
                    ctx_1.globalAlpha = 1;

                    HitArray[i].life -= 0.01;
                }
            }
        }
    }
    setInterval( render_particles, 40 );
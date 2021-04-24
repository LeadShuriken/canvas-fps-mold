   // -------------------------- //
    //   VELOCITY INITIALIZATION  //
    // -------------------------- //

    function makeVelocityCalculator(e_init, e) {
            var x = e_init.clientX, new_x,new_y,new_t,
                x_dist, y_dist, interval,velocity,
                y = e_init.clientY,
                t;
        if (e === false) {return 0;}
        t = e.time;
           new_x = e.clientX;
           new_y = e.clientY;
           new_t = Date.now();
           x_dist = new_x - x;
                    y_dist = new_y - y;
                    interval = new_t - t;
                // update values:
                x = new_x;
                y = new_y;
                velocity = Math.sqrt(x_dist*x_dist+y_dist*y_dist)/interval;
                return velocity;
    }


    // --------------------------------- //
    //             ANIMATIONS            //
    // --------------------------------- //

    function shoot_animation (flash_holder, flash_array, shooting_hand){
        flash_holder.style.left = "0"; 
        var shooting_time = 0;
        for (var i = 0; i < 11; i++)
        {
            var counter = 0;
            setTimeout(
                function(){
                    if(counter === 10){
                        flash_holder.style.left = "0";
                        flash_holder.src = resources.get(flash_array[Math.floor(Math.random() * (flash_array.length - 1))]).src;

                        shooting_hand.classList.remove("gun-frame-10");
                        shooting_hand.classList.add("gun-frame-0");

                    } else {
                        flash_holder.style.left = parseInt(flash_holder.style.left) - 200 + "px";
                        flash_holder.src = resources.get(flash_array[Math.floor(Math.random() * (flash_array.length - 1))]).src;

                        shooting_hand.classList.remove("gun-frame-" + (counter++));
                        shooting_hand.classList.add("gun-frame-" + (counter));
                    }
                } , shooting_time );
            shooting_time += 30;
        }
    }

    function gun_look_at(event , shooting_hand, flash_cutter) {
        event.stopPropagation();
        shooting_hand.style.webkitTransform = flash_cutter.style.webkitTransform = shooting_hand.style.transform = flash_cutter.style.transform = "rotate3d(0,1,0," + (Math.cos(Math.PI*event.clientX/W))*-5 + "deg) " + 
                                                "rotate3d(1,0,0," + (Math.cos(Math.PI*event.clientY/H))*10 + "deg) " +
                                                "skewX(" + (Math.cos(Math.PI*event.clientX/W)) + "deg) " +
                                                "translateX(" + (Math.cos(Math.PI*event.clientX/W))*20 + "px)";                
    }

    function FnReshootCooldown (){
        if((reshootHeater <= 100) || mouseDown ){
            clearInterval(reshootCooldown);
            reshootCooldown = undefined;
            termometer_numbers.style.clip = "rect(" + (186-(reshootHeater-100)/3) + "px , 100px, 206px, 0px)";
        } else {
            reshootHeater -= 5000/reshootHeater;
            reshootHeater = reshootHeater  < 100 ? 100 : reshootHeater;
            termometer_numbers.style.clip = "rect(" + (186-(reshootHeater-100)/3) + "px , 100px, 206px, 0px)";
        }
    }


    function shootHandling(e, flash_holder, flash_array, gun_speed, dataURL, Tanks_Holder, shooting_hand , particles_array, images_array){
        if(mouseDown){
            reshootHeater += 5;
            shoot_animation(flash_holder, flash_array, shooting_hand);

            termometer_numbers.style.clip = "rect(" + (186-(reshootHeater-100)/3) + "px , 100px, 206px, 0px)";

            var x_shifter = Math.random() < 0.5 ? -1 : 1;
            var y_shifter = Math.random() < 0.5 ? -1 : 1;

            var mouse_hit_x = ( mouseX + (x_shifter*gun_speed) + x_shifter*(reshootHeater/20*Math.random()) );
            var mouse_hit_y = ( mouseY + (y_shifter*gun_speed) + y_shifter*(reshootHeater/20*Math.random()) );

            var factor_z = ( ( dataURL[0].data[((mouseY*(dataURL[0].width*4)) + (mouseX*4))] )/255 );

            var object_height = undefined;
            var strike = false;

            for (var i = 0; i < Tanks_Holder.length; i++) {
                if (!Tanks_Holder[i].stop_updating && mouse_hit_x > Tanks_Holder[i].placement_array[0] && mouse_hit_x < Tanks_Holder[i].placement_array[0] + Tanks_Holder[i].placement_array[2]) {
                    if ( mouse_hit_y > Tanks_Holder[i].placement_array[1] && mouse_hit_y < Tanks_Holder[i].placement_array[1] + Tanks_Holder[i].placement_array[3] ) {
                        strike = true;
                        object_height = Tanks_Holder[i].placement_array[3];
                        if( Tanks_Holder[i].health > 0 ){
                            if(Tanks_Holder[i].once || Tanks_Holder[i].got_hit());
                            Tanks_Holder[i].health -= 1;
                        } else {
                            Tanks_Holder[i].justDied();
                        }   
                    }
                }
            }

            if( factor_z > 0 || strike ) {

                // Handle whether dirt or the tank itself was hit //
                //    PARTICLES ARRAY (SMOKE AND HIT ARRAYS)      //

                particles_array[0].push( new FireParticle( mouse_hit_x, mouse_hit_y, factor_z*5, strike, object_height ) );
                particles_array[1].push( new ParticleEmitter( W, H, (factor_z*0.05*Math.random()), (factor_z*0.05*Math.random())) );
                particles_array[1][particles_array[1].length - 1].init( (factor_z*5*Math.random()), images_array[0], images_array[1], e );
            }

            setTimeout( function() {
                shootHandling(undefined, flash_holder, flash_array, gun_speed, dataURL, Tanks_Holder, shooting_hand, particles_array , images_array);
            }, reshootHeater);

        }
    }
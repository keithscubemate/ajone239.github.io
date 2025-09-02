<script lang="ts">
    import type { Sketch } from "p5-svelte";
    import P5 from "p5-svelte";

    // Variables for position and speed of ball
    let x = 100;
    let y = 100;
    let xspeed = 2.5;
    let yspeed = 2;

    const sketch: Sketch = (p5) => {
        p5.setup = () => {
            p5.createCanvas(640, 240);
        };

        p5.draw = () => {
            p5.background(255);

            // Move the ball according to its speed.
            x = x + xspeed;
            y = y + yspeed;
            // Check for bouncing.
            if (x > p5.width || x < 0) {
                xspeed = xspeed * -1;
            }
            if (y > p5.height || y < 0) {
                yspeed = yspeed * -1;
            }
            // Draw the ball at the position (x, y).
            p5.stroke(0);
            p5.fill(127);
            p5.circle(x, y, 48);
        };
    };
</script>

<label>
    X Speed
    <input type="range" bind:value={xspeed} min="-5" max="5" step="0.01" />
    {xspeed}
</label>

<label>
    Y Speed
    <input type="range" bind:value={yspeed} min="-5" max="5" step="0.01" />
    {yspeed}
</label>

<P5 {sketch} />

<style lang="scss">
    input[type="range"] {
        &::-webkit-slider-runnable-track,
        &::-moz-range-track,
        &::-ms-track {
            background: transparent;
            border-color: red;
            color: red;
        }

        &::-webkit-slider-runnable-thumb,
        &::-moz-range-thumb,
        &::-ms-thumb {
            background: red;
        }
    }
</style>

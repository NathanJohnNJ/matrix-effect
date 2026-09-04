# MATRIX EFFECT - RAINING CODE

Matrix Effect is an interactive Matrix-style animation that displays randomly falling glyphs. Choose an effect from the dashboard, customise the animation, and generate ASCII art from one or more lines of text.

## Effects

- **Rain** displays an uninterrupted stream of falling glyphs.
- **ASCII Generator** lets you enter text and builds it into large ASCII art while the rain continues around it.

The animation continues while settings are edited. Settings can be opened over the current effect and closed to return to the same route. Use the reset control in the navigation bar to restart the current animation manually.

## Customisable settings

The settings page includes controls for:

- Gradient colours and colour-stop positions
- Gradient angle
- Animation speed
- ASCII column width
- Automatic hiding and timing for the navigation bar and text input
- Rain-out, which releases completed ASCII art back into the falling rain
- Loop animation, which rebuilds the ASCII art after it has rained out

Changing the ASCII column width restarts the animation because it changes the size of the generated characters. Other settings update the current animation without restarting it.

## Multi-line ASCII art

The ASCII Generator supports up to three input lines. Each line is rendered as a separate row of ASCII art. Empty lines are ignored, and text is displayed in uppercase.

## URL parameters

You can link directly to the ASCII Generator with the `string`, `string2`, and `string3` search parameters. URL-encode spaces and other special characters. URL settings override saved settings, which override the application defaults when no value is supplied.

For example:

```text
https://rain.njtd.xyz/ascii-generator?string=not%20just&string2=the&string3=design
```

This opens the ASCII Generator with three editable inputs and renders:

![Example output of ASCII Generator](./public/njtd.png)

With no parameters, the generator defaults to `MATRIX`. One or two parameters can also be supplied; they become one or two rendered lines.

## URL settings

The following search parameters customise the animation:

- `hideNav=true|false`
- `navHideSpeed=<seconds>`
- `hideInput=true|false`
- `inputHideSpeed=<seconds>`
- `rainOut=true|false`
- `loopAnimation=true|false`
- `rainOutSpeed=<seconds>`
- `gradientAngle=<degrees>`
- `columnWidth=<number>`
- `speed=<frames per second>`
- `gradient=<hex>-<percentage>` repeated once per colour

Gradient values must contain 6 or 8 hexadecimal digits, optionally prefixed with `#`, followed optionally by a dash and a 1-, 2-, or 3-digit stop percentage from `0` to `100`. Six digits specify RGB; eight digits specify RGBA. When the percentage is omitted, all supplied colours are evenly spaced.

For example:

```text
/ascii-generator?string=hello&rainOut=true&rainOutSpeed=5&hideNav=false&gradient=%2300ff00-0&gradient=00ffff-50&gradient=ffffff-100&columnWidth=4&speed=20
```

## Routes

- `/` opens the dashboard
- `/ascii-generator` opens the ASCII Generator
- `/rain` opens the falling-rain effect
- `/settings` opens settings over the current effect

This is a [Next.js](https://nextjs.org) project and was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

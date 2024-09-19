import { deserialize } from 'src/services/theme_data/iss_deserializer.js'

/* eslint-disable quotes */
const testData = ```
    Root {
        --accent: color | #e2b188;
        --badgeNotification: color | #e15932;
        --bg: color | #0f161e;
        --cBlue: color | #81beea;
        --cGreen: color | #5dc94a;
        --cOrange: color | #ffc459;
        --cRed: color | #d31014;
        --defaultButtonBevel: shadow | $borderSide(#FFFFFF, top, 0.2) | $borderSide(#000000, bottom, 0.2);
        --defaultButtonHoverGlow: shadow | 0 0 4 --text;
        --defaultButtonShadow: shadow | 0 0 2 #000000;
        --defaultInputBevel: shadow | $borderSide(#FFFFFF, bottom, 0.2)| $borderSide(#000000, top, 0.2);
        --fg: color | #151e2b;
        --font: generic | sans-serif;
        --link: color | #e2b188;
        --monoFont: generic | monospace;
        --pressedButtonBevel: shadow | $borderSide(#FFFFFF, bottom, 0.2)| $borderSide(#000000, top, 0.2);
        --selectionBackground: color | --accent;
        --selectionText: color | $textColor(--accent, --text, no-preserve);
        --text: color | #b9b9ba;
        --wallpaper: color | #0c1118;
        background: transparent;
        opacity: 0;
    }

    Root Underlay {
        background: #000000;
        opacity: 0.6;
    }

    Root Underlay, test {
        background: #000000;
        opacity: 0.6;
    }
    ```

describe.only('html_tree_converter', () => {
  describe('convertHtmlToTree', () => {
    it('should parse ISS correctly', () => {
      console.log(deserialize(testData))
    })
  })
})

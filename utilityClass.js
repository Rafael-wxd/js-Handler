// canvas工具类
class CanvasHandler {
  constructor (element) {
    if (!element) {
      throw "Element can't stomach empty"
    }

    const dom = document.querySelector(element)

    if (!dom) {
      throw 'Element does not have a DOM'
    }
    this.canvas = dom
    this.ctx = dom.getContext('2d')
  }

  // 画图片 参数：图片地址 x坐标 y坐标 宽 高 回调函数
  // 回调函数：如果传了回调函数会返回图片的dom 第二个参数为next-不执行不会往下走
  // next可穿绘制图片的宽度和高度-不传为默认传的宽度和高度,都不传为默认的图片宽高
  drawImage (src, x = 0, y = 0, width, height, callback) {
    const that = this
    const img = new Image()
    img.src = src
    img.onload = function () {
      const imgInfo = this
      const imgWidth = this.width
      const imgHeight = this.height
      if (typeof callback === 'function') {
        callback(imgInfo, function (wid, hei) {
          that.ctx.drawImage(img, x, y, wid || width || imgWidth, hei || height || imgHeight)
        })
      } else {
        that.ctx.drawImage(img, x, y, width || imgWidth, height || imgHeight)
      }
    }
  }
}

// 文件操作类
class FileHandler {
  // 将上传的文件转换为base64 可上传file或者fileList
  async fileToBase64 (files) {
    let fileArr = []
    if (files instanceof File) {
      fileArr = [files]
    } else if (files instanceof FileList) {
      fileArr = files
    } else {
      throw 'File format error '
    }
    return new Promise((resolve, reject) => {
      let retArr = []
      for (let i = 0; i < fileArr.length; i++) {
        const file = fileArr[i]
        const reads = new FileReader()
        reads.readAsDataURL(file)
        reads.onload = function () {
          retArr.push(this.result)

          if (retArr.length >= fileArr.length) {
            resolve(retArr)
          }
        }
      }
    })
  }
}

// 颜色操作类
// 返回{$hex, $hsbm $rgba}
(function (window) {

  const rgbaReg = /^(rgba|RGBA)/
  const rgbReg = /^(rgb|RGB)/
  const hexReg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/

  const hsbToRgbObj = function (hsb) {
    const rgb = {}
    let h = Math.round(hsb['h'])
    let s = Math.round(hsb['s'] * 255 / 100)
    let b = Math.round(hsb['b'] * 255 / 100)
    if (s === 0) {
      rgb['r'] = rgb['g'] = rgb['b'] = b
    } else {
      let num1 = b
      let num2 = (255 - s) * b / 255
      let num3 = (num1 - num2) * (h % 60) / 60
      if (h === 360) {
        h = 0
      }
      if (h < 60) {
        rgb['r'] = num1
        rgb['g'] = num2 + num3
        rgb['b'] = num2
      } else if (h < 120) {
        rgb['r'] = num1 - num3
        rgb['g'] = num1
        rgb['b'] = num2
      } else if (h < 180) {
        rgb['r'] = num2
        rgb['g'] = num1
        rgb['b'] = num2 + num3
      } else if (h < 240) {
        rgb['r'] = num2
        rgb['g'] = num1 - num3
        rgb['b'] = num1
      } else if (h < 300) {
        rgb['r'] = num2 + num3
        rgb['g'] = num2
        rgb['b'] = num1
      } else if (h < 360) {
        rgb['r'] = num1
        rgb['g'] = num2
        rgb['b'] = num1 - num3
      } else {
        rgb['r'] = 0
        rgb['g'] = 0
        rgb['b'] = 0
      }
    }
    return {
      r: Math.round(rgb['r']),
      g: Math.round(rgb['g']),
      b: Math.round(rgb['b']),
      a: 1
    }
  }
  const hexToRgbObj = function (hex) {
    hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16)
    return {
      r: hex >> 16,
      g: (hex & 0x00FF00) >> 8,
      b: (hex & 0x0000FF),
      a: 1
    }
  }
  const rgbObjToHsb = function (rgb) {
    const hsb = {
      h: 0,
      s: 0,
      b: 0
    }
    const min = Math.min(rgb['r'], rgb['g'], rgb['b'])
    const max = Math.max(rgb['r'], rgb['g'], rgb['b'])
    const cz = max - min
    hsb['b'] = max
    hsb['s'] = max !== 0 ? 255 * cz / max : 0
    if (hsb['s'] !== 0) {
      if (rgb['r'] === max) {
        hsb['h'] = (rgb['g'] - rgb['b']) / cz
      } else if (rgb['g'] === max) {
        hsb['h'] = 2 + (rgb['b'] - rgb['r']) / cz
      } else {
        hsb['h'] = 4 + (rgb['r'] - rgb['g']) / cz
      }
    } else {
      hsb['h'] = -1
    }
    hsb['h'] *= 60
    if (hsb['h'] < 0) {
      hsb['h'] += 360
    }
    hsb['s'] *= 100 / 255
    hsb['b'] *= 100 / 255
    return hsb;
  }
  const hexToHsb = function (hex) {
    return rgbObjToHsb(hexToRgbObj(hex))
  }
  const rgbObjToHex = function (rgb) {
    var hex = [
      rgb['r'].toString(16),
      rgb['g'].toString(16),
      rgb['b'].toString(16)
    ]
    hex.map(function (str, i) {
      if (str.length == 1) {
        hex[i] = '0' + str
      }
    })
    return '#' + hex.join('')
  }
  const rgbStrToHex = function (color) {
    var rgb = color.split(',')
    var r = parseInt(rgb[0].split('(')[1])
    var g = parseInt(rgb[1])
    var b = parseInt(rgb[2].split(')')[0])
    var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    return hex
  }
  const rgbaStrToRgba = function (str) {
    const strArr = str.toLocaleUpperCase().replace('RGBA(', '').replace(')', '').split(',')
    const rgba = {
      r: parseInt(strArr[0]),
      g: parseInt(strArr[1]),
      b: parseInt(strArr[2]),
      a: parseFloat(strArr[3]),
    }
    return rgba
  }
  const getThemeCluster = function (theme) {
    const tintColor = (color, tint) => {
      let red = parseInt(color.slice(0, 2), 16)
      let green = parseInt(color.slice(2, 4), 16)
      let blue = parseInt(color.slice(4, 6), 16)

      if (tint === 0) {
        return [red, green, blue].join(',')
      } else {
        red += Math.round(tint * (255 - red))
        green += Math.round(tint * (255 - green))
        blue += Math.round(tint * (255 - blue))

        red = red.toString(16)
        green = green.toString(16)
        blue = blue.toString(16)

        return `#${ red }${ green }${ blue }`
      }
    };

    const shadeColor = (color, shade) => {
      let red = parseInt(color.slice(0, 2), 16)
      let green = parseInt(color.slice(2, 4), 16)
      let blue = parseInt(color.slice(4, 6), 16)

      red = Math.round((1 - shade) * red)
      green = Math.round((1 - shade) * green)
      blue = Math.round((1 - shade) * blue)

      red = red.toString(16)
      green = green.toString(16)
      blue = blue.toString(16)

      return `#${ red }${ green }${ blue }`
    };

    const clusters = [theme]
    for (let i = 0; i <= 9; i++) {
      clusters.push(tintColor(theme, Number((i / 10).toFixed(2))))
    }
    clusters.push(shadeColor(theme, 0.1))
    return clusters
  }

  class ColorProcessing {
    constructor (color) {
      if (typeof color === 'string') {
        if (rgbaReg.test(color)) {
          this.init('rgba', rgbaStrToRgba(color))
        } else if (rgbReg.test(color)) {
          this.init('hex', rgbStrToHex(color))
        } else if (hexReg.test(color)) {
          this.init('rgb', hexToRgbObj(color))
        } else {
          throw new Error('The color type is not recognized. string')
        }
      } else if (typeof color === 'object' && !Array.isArray(color)) {
        if (color['r'] && color['g'] && color['b'] && color['a']) {
          const {r, g, b, a} = color
          this.init('rgba', {r, g, b, a})
        } else if (color['r'] && color['g'] && color['b']) {
          this.init('hsb', rgbObjToHsb(color))
        } else if (color['h'] && color['s'] && color['b']) {
          this.init('rgb', hsbToRgbObj(color))
        } else {
          throw new Error('The color type is not recognized. object')
        }
      } else {
        throw new Error('The color type is not recognized. null')
      }
    }
    // 创建hex rgba hsb
    init (type, color) {
      if (type === 'hex') {
        this.$hex = color
        this.$rgba = hexToRgbObj(color)
        this.$hsb = rgbObjToHsb(this.$rgba)
      } else if (type === 'rgb') {
        this.$rgba = color
        this.$hex = rgbObjToHex(color)
        this.$hsb = rgbObjToHsb(color)
      } else if (type === 'hsb') {
        this.$hsb = color
        this.$rgba = hsbToRgbObj(color)
        this.$hex = rgbObjToHex(this.$rgba)
      } else if (type === 'rgba') {
        this.$rgba = color
        this.$hsb = rgbObjToHsb(color)
        this.$hex = rgbObjToHex(this.$rgba)
      }
    }
    // 返回字符串的rgb
    rgbToString () {
      const {r, g, b} = this.$rgba
      return `rgb(${r}, ${g}, ${b})`
    }
    // 返回字符串的rgba
    rgbaToString () {
      const {r, g, b, a} = this.$rgba
      return `rgb(${r}, ${g}, ${b}, ${a})`
    }
    // 传入 new 新的颜色会返回创建的颜色和新的颜色所有透明颜色值
    getThemeCluster (newColor) {
      const newColorProcessing = new ColorProcessing(newColor)
      return {
        oldColors: getThemeCluster(this.$hex.replace('#', '')),
        newColors: getThemeCluster(newColorProcessing.$hex.replace('#', ''))
      }
    }
    // 改变style中的创建颜色改为新的颜色
    setThemeCluster (newColor, id) {
      const colorObj = this.getThemeCluster(newColor)

      const {oldColors, newColors} = colorObj

      const styles = document.querySelectorAll('style')
      styles.forEach((style) => {
        oldColors.forEach((old, index) => {
          if (id) {
            if (style.innerText.indexOf(id) !== -1) {
              style.innerText = style.innerText.replace(new RegExp(old, 'ig'), newColors[index])
            }
          } else {
            style.innerText = style.innerText.replace(new RegExp(old, 'ig'), newColors[index])
          }
        })
      })
    }
  }

  ['hex', 'rgba', 'hsb'].forEach((key) => {
    ColorProcessing.prototype[key] = function () {
      return this['$' + key]
    }
  });

  window.ColorProcessing = ColorProcessing

})(window)

// dom操作类
class DomHandler {
  constructor (element) {
    if (!element) {
      throw "Element can't stomach empty"
    }

    const dom = document.querySelector(element)

    if (!dom) {
      throw 'Element does not have a DOM'
    }
    this.dom = dom
  }
  // 打印dom中的内容
  // 参数1： 是否展示页眉 boolean
  // 参数2：参数1为false时页眉的标题
  printPart (isHeader = false, title = '') {
    const el = this.dom
    const iframe = document.createElement('IFRAME')
    const style = document.createElement('style')
    style.innerHTML = "@page {size: auto; margin: 0;}"
    iframe.setAttribute('style', 'position: absolute;width: 0px;height: 0px;left: -500px; top:-500px;')
    iframe.onload = function () {
      const doc = iframe.contentWindow.document
      document.title = title || ''
      doc.write('<div>' + el.innerHTML + '</div>')
      if (isHeader) {
        doc.querySelector('head').appendChild(style)
      }
      doc.close()
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
      if (navigator.userAgent.indexOf("MSIE") > 0) {
        document.body.removeChild(iframe)
      }
    }
    document.body.appendChild(iframe)
  }
}

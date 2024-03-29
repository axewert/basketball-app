class MainScene extends Phaser.Scene {

  constructor(config) {
    super({
      key: 'Main',
      physics: {
        default: 'arcade',
        arcade: {
          debug: true,
          gravity: {
            y: 4000
          }
        },
        matter: {
          debug: false,
          gravity: { y: 10 }
        }
      },
    })
  }

  init() {
    this.centerX = 320
    this.centerY = 320
    this.basketLines = []
    this.initialPosition = {
      shield: {x: this.centerX - 240, y: this.centerY - 120},
      ball: {x: this.centerX, y: 872},
      ring: {x: this.centerX, y: this.centerY + 136},
      floor: {x: this.centerX, y: this.centerY + 620},
      scoreCounter: {x: this.centerX, y: 290},
      recordCounter: {x: this.centerX - 155, y: 472},
      basketCounter: {x: this.centerX - 155, y: 502},
      cleanSeriesCounter: {x: this.centerX, y: 415},
      coinCounter: {x: this.centerX + 220, y: this.centerY + 770},
      leftPin: {x: 0, y: 0},
      rightPin: {x: 0, y: 0},
      basketNetPoints: [],
      coin: {x: this.centerX, y: this.centerY + 300},
    }
    this.scoreCount = null
    this.recordCount = this.game.data.recordCount || 0
    this.basketCount = this.game.data.basketCount || 0
    this.cleanSeriesCount = null
    this.levelCount = 0
    this.coinCount = this.game.data.coinCount || 0
    this.initFont()
  }

  initFont() {
    this.countStyle = {
      font: '100px montserrat',
      fill: 'white'
    }

    this.miniCountStyle = {
      font: '30px montserrat',
      fill: 'white'
    }

    this.cleanSeriesCountStyle = {
      font: '80px montserrat',
      fill: 'yellow'
    }
    this.coinCountStyle = {
      font: '40px montserrat',
      fill: 'white'
    }
    this.goalTextStyle = {
      font: '50px montserrat',
      fill: 'white'
    }
  }

  preload() {
    this.load.image('ball', 'assets/sprites/ball.png')
    this.load.image('ball_shadow', 'assets/sprites/ball_shadow.png')
    this.load.image('floor', 'assets/sprites/floor.png')
    this.load.image('menu', 'assets/sprites/menu.png')
    this.load.image('ring', 'assets/sprites/ring.png')
    this.load.image('shield', 'assets/sprites/shield.png')
    this.load.image('coin', 'assets/sprites/coin.png')
    this.load.plugin('rexdragplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexdragplugin.min.js', true)
    this.load.plugin('rexroundrectangleplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexroundrectangleplugin.min.js', true)


    this.load.audio('aaaaa', 'assets/sounds/aaaaa.mp3')
    this.load.audio('ball_bounce', 'assets/sounds/ball_bounce.mp3')
    this.load.audio('bell', 'assets/sounds/bell.mp3')
    this.load.audio('clean_goal', 'assets/sounds/clean_goal.mp3')
    this.load.audio('dirty_goal', 'assets/sounds/dirty_goal.mp3')
    this.load.audio('ring_impact', 'assets/sounds/ring_impact.mp3')
    this.load.audio('woosh', 'assets/sounds/woosh.mp3')
  }

  create() {
    this.thickLine = this.add.graphics({ lineStyle: { width: 5, color: 0xffffff }})
    this.thinLine = this.add.graphics({ lineStyle: { width: 3, color: 0xffffff }})
    this.shield = this.add.image(this.initialPosition.shield.x, this.initialPosition.shield.y, 'shield').setOrigin(0)
    this.ring = this.add.image(this.initialPosition.ring.x, this.initialPosition.ring.y, 'ring')
      .setOrigin(0.5,0)
      .setDepth(10)
    this.ring.isReady = true
    this.floor = this.add.image(this.initialPosition.floor.x, this.initialPosition.floor.y, 'floor')
    this.createPins()
    this.createBall()
    this.createCounters()
    this.createCoin()
    this.ballShadow = this.add.image(this.ball.x, this.initialPosition.ball.y + this.ballRadius, 'ball_shadow')
    this.ballReset()
    this.createSounds()
    this.createMenu()
    this.createBasketNet()

    this.goalText = this.add.text(
      this.initialPosition.coin.x,
      this.initialPosition.coin.y + 50,
      null,
      this.goalTextStyle
    )
      .setOrigin(0.5)
      .setDepth(20)

    this.shieldGroup = [
      this.shield,
      this.basketCounter,
      this.cleanSeriesCounter,
      this.recordCounter,
      this.scoreCounter,
      this.ring,
      this.leftPin,
      this.rightPin,
      ...this.basketNet[0].map(netPoint => netPoint.position),
      this.coin,
      this.goalText
    ]
    this.addCollide()
  }

  getGraphics(thickness) {
    return thickness === 3
      ? this.thinLine
      : this.thickLine
  }

  createBasketNet() {
    this.initialPosition.basketNetPoints = [
      [
        {x: -85, y: 5},
        {x: -42, y: 5},
        {x: 42, y: 5},
        {x: 85, y: 5}
      ],
      [
        {x: -68, y: 7},
        {x: -35, y: 7},
        {x: 35, y: 7},
        {x: 68, y: 7},

      ],
      [
        {x: -50, y: 10},
        {x: 0, y: 10},
        {x: 50, y: 10}
      ],
      [
        {x: -58, y: 15},
        {x: -26, y: 15},
        {x: 26, y: 15},
        {x: 58, y: 15},

      ],
      [
        {x: -50, y: 20},
        {x: 0, y: 20},
        {x: 50, y: 20}
      ],
      [
        {x: -48, y: 30},
        {x: -28, y: 30},
        {x: 28, y: 30},
        {x: 48, y: 30}
      ],
      [
        {x: -46, y: 40},
        {x: 0, y: 20},
        {x: 46, y: 40}
      ],
    ]

    this.basketNet = this.initialPosition.basketNetPoints.map(row => row.map(({x,y}) => {
      return this.matter.add.circle(this.ring.x + x,this.ring.y + y,6, {
          render: {
            visible: true
          }
        })
    }))
    const createConstraint = (start, end, lineThickness = 3) => {
      const distance = Phaser.Math.Distance.Between(
        start.position.x, start.position.y,
        end.position.x, end.position.y
      )
      this.matter.add.constraint(start, end, distance, 0.06)
      this.basketLines.push({
        start, end, lineThickness
      })
    }
    const firstRow = 0
    const lastRow = this.basketNet.length - 1

    this.basketNet[firstRow].forEach((point, pointIndex) => {
      point.isStatic = true
      const start = this.basketNet[firstRow][pointIndex]
      const end = this.basketNet[firstRow+1][pointIndex]
      createConstraint(start, end)
    })

    this.basketNet[lastRow].forEach((_, pointIndex) => {
      const start = this.basketNet[lastRow][pointIndex]
      const endPoints = [
        this.basketNet[lastRow-1][pointIndex],
        this.basketNet[lastRow-1][pointIndex+1],
      ]
        .forEach(end => createConstraint(start, end))
    })

    this.basketNet
      .forEach((row,rowIndex) => {
        if (row.length === 3 && rowIndex !== lastRow) {
          row.forEach((_, pointIndex) => {
            const start = this.basketNet[rowIndex][pointIndex];
            [
              this.basketNet[rowIndex-1][pointIndex],
              this.basketNet[rowIndex-1][pointIndex+1],
              this.basketNet[rowIndex+1][pointIndex],
              this.basketNet[rowIndex+1][pointIndex+1]
            ]
              .forEach(end => createConstraint(start, end))
          })
        }

        if (rowIndex !== 1 && rowIndex !== 2 && rowIndex !== lastRow) {
          const startLeft = this.basketNet[rowIndex][0]
          const endLeft = this.basketNet[rowIndex+1][0]
          const startRight = this.basketNet[rowIndex][row.length-1]
          const endRight = this.basketNet[rowIndex+1][this.basketNet[rowIndex+1].length-1]
          if (!endLeft || !endRight) return
          createConstraint(startLeft,endLeft,5)
          createConstraint(startRight,endRight,5)
        }

        else if (rowIndex === 1) {
          const startLeft = this.basketNet[rowIndex][0]
          const endLeft = this.basketNet[rowIndex+2][0]
          const startRight = this.basketNet[rowIndex][row.length-1]
          const endRight = this.basketNet[rowIndex+2][this.basketNet[rowIndex+2].length-1]
          createConstraint(startLeft,endLeft,5)
          createConstraint(startRight,endRight,5)
        }
      })
    this.drawLines()
  }

  createCoin() {
    this.coin = this.add.image(this.initialPosition.coin.x,this.initialPosition.coin.y,'coin')
    this.coin.alpha = 0

    this.coinTween = this.tweens.add({
      targets: this.coin,
      scaleX: 0.1,
      ease: 'Linear',
      duration: 500,
      yoyo: true,
      repeat: 2,
      loop: -1,
      loopDelay: 100
    })

    this.isCoinActive = false
    this.earnedCoin = this.add.image(this.initialPosition.coin.x,this.initialPosition.coin.y,'coin')
    this.earnedCoin.alpha = 0
  }

  showCoin() {
    this.isCoinActive = true
    this.coinTween.play()
    this.scaleX = 1
    this.tweens.add({
      targets: this.coin,
      alpha: 1,
      ease: 'Linear',
      duration: 200,
    })
  }

  setGoalText(text) {
    this.goalText.alpha = 1
    this.goalText.setText(`+${text}`)
    const initialPosY = this.goalText.y
    this.tweens.add({
      targets: this.goalText,
      y: this.goalText.y - 100,
      alpha: 0,
      ease: 'Linear',
      duration: 500,
      delay: 1000,
      onComplete: () => {
        this.goalText.y = initialPosY
      }
    })
  }

  createMenu() {
    this.menu = this.add.image(60, 60, 'menu')
    this.menu.setInteractive().on('pointerdown', () => {
      console.log('menu')
    })
  }

  createSounds() {
    this.sounds = {
      aaaaa: this.sound.add('aaaaa', {volume: 0.5}),
      ball_bounce: this.sound.add('ball_bounce', {volume: 0.5}),
      bell: this.sound.add('bell', {volume: 0.5}),
      clean_goal: this.sound.add('clean_goal', {volume: 0.5}),
      dirty_goal: this.sound.add('dirty_goal', {volume: 0.5}),
      ring_impact: this.sound.add('ring_impact', {volume: 0.5}),
      woosh: this.sound.add('woosh', {volume: 0.5}),
    }
  }
  createCounters() {
    this.scoreCounter = this.add.text(
      this.initialPosition.scoreCounter.x,
      this.initialPosition.scoreCounter.y,
      this.scoreCount,
      this.countStyle
    )
      .setOrigin(0.5)

    this.recordCounter = this.add.text(
      this.initialPosition.recordCounter.x,
      this.initialPosition.recordCounter.y,
      this.recordCount,
      this.miniCountStyle
    )
      .setOrigin(0.5)
      .setAlign('left')

    this.basketCounter = this.add.text(
      this.initialPosition.basketCounter.x,
      this.initialPosition.basketCounter.y,
      this.basketCount,
      this.miniCountStyle
    )
      .setOrigin(0.5)
      .setAlign('left')

    this.cleanSeriesCounter = this.add.text(
      this.initialPosition.cleanSeriesCounter.x,
      this.initialPosition.cleanSeriesCounter.y,
      this.cleanSeriesCount,
      this.cleanSeriesCountStyle
    )
      .setOrigin(0.5)
    this.coinCounter = {}
    this.coinCounter.text = this.add.text(
      this.initialPosition.coinCounter.x,
      this.initialPosition.coinCounter.y,
      this.coinCount,
      this.coinCountStyle
    )
      .setOrigin(0.5)
      .setAlign('left')
      .setDepth(10)
    this.coinCounter.image = this.add.image(
      this.initialPosition.coinCounter.x + 48,
      this.initialPosition.coinCounter.y,
      'coin'
    )
      .setDepth(10)

    this.coinCounter.bg = this.add.graphics()
      .fillStyle(0x93aaa6, 1)
      .fillRoundedRect(
        this.initialPosition.coinCounter.x - 25,
        this.initialPosition.coinCounter.y - 25,
        100,
        50,
        10
      )
  }

  createPins() {
    this.initialPosition.leftPin = {x: this.ring.x - 85, y: this.ring.y + 5}
    this.initialPosition.rightPin = {x: this.ring.x + 85, y: this.ring.y + 5}

    this.leftPin = this.add.circle(
      this.initialPosition.leftPin.x,
      this.initialPosition.leftPin.y,
      6
    )
      .setName('leftPin')

    this.rightPin = this.add.circle(
      this.initialPosition.rightPin.x,
      this.initialPosition.leftPin.y,
      6
    )
      .setName('rightPin')

    this.physics.add.existing(this.leftPin)
    this.physics.add.existing(this.rightPin)

    this.leftPin.body.setCircle(6).setImmovable()
    this.leftPin.body.allowGravity = false

    this.rightPin.body.setCircle(6).setImmovable()
    this.rightPin.body.allowGravity = false
  }

  createBall() {
    this.ball = this.physics.add.image(this.initialPosition.ball.x, this.initialPosition.ball.y, 'ball')
    this.ballRadius = 88
    this.ball.body.setCircle(this.ballRadius)
    this.ballSetInteractive()
    this.ball.body.setBounce(0.8)
  }

  ballSetInteractive() {
    this.drag = this.plugins.get('rexdragplugin').add(this.ball, {enable: true})
    this.ball
      .on('dragstart', (pointer, dragX, dragY) => {
        this.timeDragStart = 0
      })
      .on('drag', (pointer, dragX, dragY) => {
        if(this.timeDragStart === 0) this.timeDragStart = Date.now()
        if(this.initialPosition.ball.y - this.ball.y > 60) this.ballMove()
      })
      .on('dragend', (pointer, dragX, dragY, dropped) => {
        if(!this.isBallMove) this.ballRelease()
      })
  }

  ballRelease() {
    this.drag.setEnable(false)
    this.ball.setActive(false)
    this.tweens.add({
      targets: this.ball,
      x: this.initialPosition.ball.x,
      y: this.initialPosition.ball.y,
      ease: 'Linear',
      duration: 100,
      onComplete: () => {
        this.drag.setEnable(true)
        this.ball.setActive(true)
      }
    })
  }

  ballMove() {
    this.drag.dragend()
    this.drag.setEnable(false)
    this.ball.setActive(false)
    this.ball.body.allowGravity = true
    const timeDrag = Date.now() - this.timeDragStart
    let speedDrag = timeDrag * 10
    if (speedDrag > 1000) speedDrag = 1000
    this.ball.body.velocity.y = -2700 + speedDrag
    this.ball.body.velocity.x = (this.ball.x - this.initialPosition.ball.x) * 20
    this.ball.body.setAngularVelocity(this.ball.body.velocity.x)
    this.isBallMove = true
    this.sounds.woosh.play()
  }

  ballReset() {
    this.ball.setActive(false)
    this.ball.body.allowGravity = false
    this.isBallMove = false
    this.ball.depth = 20
    if(this.isGoal) this.isGoal = false
    else {
      this.resetCount()
    }
    this.tweens.add({
      targets: this.ball,
      alpha: 0,
      ease: 'Linear',
      duration: 100,
      onComplete: () => {
        this.ball.body.velocity.x = 0
        this.ball.body.velocity.y = 0
        this.ball.body.setAngularVelocity(0)
        this.tweens.add({
          targets: this.ball,
          x: this.initialPosition.ball.x,
          y: this.initialPosition.ball.y,
          ease: 'Linear',
          duration: 100,
          onComplete: () => {
            this.ball.setAlpha(1)
            this.ball.setActive(true)
            this.drag.setEnable(true)
            this.ball.setScale(1)
            this.moveShieldGroup()
          }
        })
      }
    })
  }

  shieldGroupReset() {
    const x =  this.initialPosition.shield.x - this.shield.x;
    const y = this.initialPosition.shield.y - this.shield.y;
    this.shieldGroup.forEach(el => {
      this.tweens.add({
        targets: el,
        x: el.x + x,
        y: el.y+ y,
        ease: 'Linear',
        duration: 300,
      })
    })
  }

  addCollide() {
    this.physics.add.collider(this.ball, this.leftPin, this.pinCollide, this.targetCollideControl, this)
    this.physics.add.collider(this.ball, this.rightPin, this.pinCollide, this.targetCollideControl, this)
  }

  pinCollide() {
    this.isPinCollide = true
    this.sounds.ball_bounce.play()

    const ringStartY = this.ring.y
    const ringOffsetY = -10
    if(!this.ring.isReady) return
    this.ring.isReady = false
    this.tweens.add({
      targets: [this.ring, ...this.basketNet[0].map(point => point.position)],
      y: this.ring.y + ringOffsetY,
      ease: 'Linear',
      repeat: 0,
      yoyo: true,
      duration: 20,
      onComplete: () => {
        this.ring.y = ringStartY
        this.ring.isReady = true
      }
    })
  }

  targetCollideControl (ball, pin) {
    if(ball.depth === 20) return false
  }


  drawLines() {
    this.thinLine.clear()
    this.thickLine.clear()
    this.basketLines.forEach(({start, end, lineThickness}) => {
      const geometry = new Phaser.Geom.Line(start.position.x, start.position.y, end.position.x, end.position.y)
      const graphics = this.getGraphics(lineThickness)
      graphics.strokeLineShape(geometry)
      graphics.setDepth(10)
    })
  }

  goal() {
    const modifier = this.cleanSeriesCount
      ? this.cleanSeriesCount
      : 1
    if (this.isPinCollide) {
      const scorePoint = 2 * modifier
      this.scoreCount += scorePoint
      this.sounds.dirty_goal.play()
      this.cleanSeriesCount = null
      this.cleanSeriesCounter.setText(this.cleanSeriesCount)
      this.setGoalText(scorePoint)
    } else {
      const scorePoint = 3 * modifier
      this.scoreCount += scorePoint
      this.sounds.clean_goal.play()
      this.cleanSeriesCount++
      this.cleanSeriesCounter.setText(this.cleanSeriesCount > 1 ? `x${this.cleanSeriesCount}` : null)
      this.setGoalText(scorePoint)
    }
    this.isGoal = true
    this.isPinCollide = false

    this.sounds.bell.play()

    this.ball.body.velocity.y = this.ball.body.velocity.y / 5

    this.tweens.add({
      targets: this.ball,
      x: this.initialPosition.ball.x,
      ease: 'Linear',
      duration: 100,
      onComplete: () => {
        this.ball.body.velocity.y = 0
      }
    })

    this.basketNet.forEach(row => {
      this.tweens.add({
        targets: row[0].force,
        x: -this.getRandom(0,2)/1000,
        ease: 'Linear',
        duration: 150,
        onComplete: (() => {
          row[0].force.x = 0
        })
      })
      this.tweens.add({
        targets: row[row.length - 1].force,
        x: this.getRandom(0,2)/1000,
        ease: 'Linear',
        duration: 150,
        onComplete: (() => {
          row[row.length - 1].force.x = 0
        })
      })
    })

    this.updateCount()
    this.isCoinActive
      ? this.moveCoin()
      : this.showCoin()
  }

  moveCoin() {
    this.coin.alpha = 0
    this.earnedCoin.alpha = 1
    this.tweens.add({
      targets: this.earnedCoin,
      x: this.coinCounter.image.x,
      y: this.coinCounter.image.y,
      ease: 'Linear',
      duration: 500,
      onComplete: () => {
        this.earnedCoin.alpha = 0
        this.earnedCoin.setPosition(
          this.coin.x,
          this.coin.y
        )
        this.coinCount++
        this.coinCounter.text.setText(this.coinCount)
        this.showCoin()
      }
    })
  }

  updateCount() {
    this.basketCount++
    this.levelCount++
    this.basketCounter.setText(this.basketCount)
    this.game.data.basketCount = this.basketCount
    this.game.data.coinCount = this.coinCount
    this.scoreCounter.setText(this.scoreCount)
    if(this.scoreCount > this.recordCount) {
      this.recordCount = this.scoreCount
      this.recordCounter.setText(this.recordCount)
    }
    this.game.saveUserData()
  }

  resetCount() {
    if (this.scoreCount > 0) this.sounds.aaaaa.play()
    this.levelCount = 0
    this.scoreCount = null
    this.scoreCounter.setText(this.scoreCount)
    this.cleanSeriesCount = null
    this.cleanSeriesCounter.setText(this.cleanSeriesCount)
    this.coin.alpha = 0
    this.isCoinActive = false
  }

  moveShieldGroup() {
    if(!this.levelCount) return
    const x = this.getRandom(-100,100)
    const y = this.levelCount > 2 ? this.getRandom(-100,100) : 0
    this.shieldGroup.forEach(el => {
      this.tweens.add({
        targets: el,
        x: el.x + x,
        y: el.y+ y,
        ease: 'Linear',
        duration: 300,
      })
    })
  }

  getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  update() {
    this.drawLines()
    if (
      this.isBallMove
      && this.ball.body.velocity.y > 0
      && this.ball.y > this.initialPosition.ball.y - 300
    ) {
      this.ballReset()
      this.shieldGroupReset()
    }
    if (
      this.ball.depth === 20
      && this.ball.body.velocity.y > 0
      && this.ball.y < this.ring.y - this.ballRadius
    ) {
      this.ball.depth = 5
    }

    const delta = this.initialPosition.ball.y - this.ball.y
    const ballScale = 1 - delta / 1500

    if (delta > 0) {
      if (delta < 500 && ballScale < this.ball.scale) this.ball.setScale(ballScale)
      if (delta < 200) this.ballShadow.setAlpha(1 - delta/200)
    }
    this.ballShadow.x = this.ball.x
    if (
      !this.isGoal
      && this.ball.depth === 5
      && this.ball.body.velocity.y > 0
      && this.ball.y > this.ring.y + 30
      && this.ball.x > this.leftPin.x
      && this.ball.x < this.rightPin.x
    ) {
      this.goal()
    }
  }
}
const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 1136,
  scale: {
    mode: Phaser.Scale.WIDTH_CONTROLS_SCALE,
    center: Phaser.Scale.NO_CENTER
  },
  backgroundColor: 0xA8DAD9,
  scene: MainScene
}

let storageData = localStorage.getItem('basket')
if (storageData) storageData = JSON.parse(storageData)
else storageData = {}

const Game = new Phaser.Game(config)
Game.data = storageData

Game.saveUserData = () => {
  localStorage.setItem('basket', JSON.stringify(Game.data))
}
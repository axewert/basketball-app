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
          debug: true,
          gravity: { y: 10 }
        }
      },
    })
  }
  init() {
    this.centerX = 320
    this.centerY = 320

    this.scoreCount = null
    this.recordCount = this.game.data.recordCount || 0
    this.basketCount = this.game.data.basketCount || 0
    this.clearCount = null

    this.initFont()
  }
  initFont() {
    this.countStyle = {
      font: '100px montserrat',
      fill: 'white'
      // stroke: "#762D0B",
      // strokeThickness: 6
    }
    this.miniCountStyle = {
      font: '30px montserrat',
      fill: 'white'
    }
    this.clearCountStyle = {
      font: '80px montserrat',
      fill: 'yellow'
    }
  }
  preload() {
    this.load.image('ball', 'assets/sprites/ball.png')
    this.load.image('ball_shadow', 'assets/sprites/ball_shadow.png')
    this.load.image('floor', 'assets/sprites/floor.png')
    this.load.image('menu', 'assets/sprites/menu.png')
    this.load.image('ring', 'assets/sprites/ring.png')
    this.load.image('shield', 'assets/sprites/shield.png')
    this.load.plugin('rexdragplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexdragplugin.min.js', true)

    this.load.audio('aaaaa', 'assets/sounds/aaaaa.mp3')
    this.load.audio('ball_bounce', 'assets/sounds/ball_bounce.mp3')
    this.load.audio('bell', 'assets/sounds/bell.mp3')
    this.load.audio('clean_goal', 'assets/sounds/clean_goal.mp3')
    this.load.audio('dirty_goal', 'assets/sounds/dirty_goal.mp3')
    this.load.audio('ring_impact', 'assets/sounds/ring_impact.mp3')
    this.load.audio('woosh', 'assets/sounds/woosh.mp3')

  }
  create() {
    this.shield = this.add.image(80, 200, 'shield').setOrigin(0)
    this.ring = this.add.image(this.centerX, this.centerY + 136, 'ring')
      .setOrigin(0.5,0)
      .setDepth(10)
    this.floor = this.add.image(this.centerX, this.centerY + 620, 'floor')
    this.createPins()
    this.createBall()
    this.ballShadow = this.add.image(this.ball.x, this.ballStartPointY + this.ballRadius, 'ball_shadow')
    this.addCollide()
    this.createCounters()
    this.ballReset()
    this.createSounds()
    this.createMenu()
    this.createBasketNet()
  }
  createBasketNet() {
    const basketNetPoints = [
      [
        {x: -85, y: 5},
        {x: -42, y: 5},
        {x: 42, y: 5},
        {x: 85, y: 5}
      ],
      [
        {x: -68, y: 35},
        {x: -35, y: 28},
        {x: 35, y: 28},
        {x: 68, y: 35},

      ],
      [
        {x: -50, y: 46},
        {x: 0, y: 46},
        {x: 50, y: 46}
      ],
      [
        {x: -58, y: 58},
        {x: -26, y: 64},
        {x: 26, y: 64},
        {x: 58, y: 58},

      ],
      [
        {x: -50, y: 84},
        {x: 0, y: 88},
        {x: 50, y: 84}
      ],
      [
        {x: -28, y: 102},
        {x: 28, y: 102},
      ],
      [
        {x: -46, y: 120},
        {x: 0, y: 116},
        {x: 46, y: 120}
      ],
    ]
    // for (let row = 0; row < basketNetPoints.length; row++) {
    //   for (let point = 0; point < basketNetPoints[row].length; point++) {
    //     const {x, y} = basketNetPoints[row][point]
    //     this.matter.add.circle(this.ring.x + x,this.ring.y + y,6, {
    //       isStatic: true,
    //       render: {
    //         visible: true
    //       }
    //     })
    //   }
    // }
    this.basketNet = basketNetPoints.map(row => row.map(({x,y}) => {
      return this.matter.add.circle(100 + x,100 + y,6, {
          isStatic: false,
          render: {
            visible: true
          }
        })
    }))
    // this.basketNet.reduce((current, acc) => {
    //   this.matter.add.constraint(acc[0], current[0], 100, 1)
    //   return acc
    // })
    this.basketNet.map((row, rowIndex) => {
      if (rowIndex === 0) {
        this.matter.add.constraint(this.basketNet[0][1], this.basketNet[1][1], 20, 1, {
          lineColor: 0xffffff,
          lineThickness: 10
        })
        this.matter.add.constraint(this.basketNet[0][2], this.basketNet[1][2])
        row.forEach(point => point.isStatic = true)
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
    this.scoreCounter = this.add.text(this.centerX = 320, 290, this.scoreCount, this.countStyle).setOrigin(0.5)
    this.recordCounter = this.add.text(this.centerX = 155, 472, this.recordCount, this.miniCountStyle).setOrigin(0.5).setAlign('left')
    this.basketCounter = this.add.text(this.centerX = 155, 502, this.basketCount, this.miniCountStyle).setOrigin(0.5).setAlign('left')
    this.clearCounter = this.add.text(this.centerX = 320, 415, this.clearCount, this.clearCountStyle).setOrigin(0.5
    )
  }
  createPins() {
    this.leftPin = this.add.circle(this.ring.x - 85, this.ring.y + 5, 6).setName('leftPin')
    this.rightPin = this.add.circle(this.ring.x + 85, this.ring.y + 5, 6).setName('rightPin')

    this.physics.add.existing(this.leftPin)
    this.physics.add.existing(this.rightPin)

    this.leftPin.body.setCircle(6).setImmovable()
    this.leftPin.body.allowGravity = false

    this.rightPin.body.setCircle(6).setImmovable()
    this.rightPin.body.allowGravity = false
  }
  createBall() {
    this.ballStartPointX = this.centerX
    this.ballStartPointY = 872
    this.ball = this.physics.add.image(this.ballStartPointX, this.ballStartPointY, 'ball')
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
        if(this.ballStartPointY - this.ball.y > 60) this.ballMove()
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
      x: this.ballStartPointX,
      y: this.ballStartPointY,
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
    this.ball.body.velocity.x = (this.ball.x - this.ballStartPointX) * 20
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
    else this.resetCount()
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
          x: this.ballStartPointX,
          y: this.ballStartPointY,
          ease: 'Linear',
          duration: 100,
          onComplete: () => {
            this.ball.setAlpha(1)
            this.ball.setActive(true)
            this.drag.setEnable(true)
            this.ball.setScale(1)
          }
        })
      }
    })
  }
  addCollide() {
    this.physics.add.collider(this.ball, this.leftPin, this.pinCollide, this.targetCollideControl, this)
    this.physics.add.collider(this.ball, this.rightPin, this.pinCollide, this.targetCollideControl, this)
  }
  pinCollide() {
    this.isPinCollide = true
    this.sounds.ball_bounce.play()

    const ringStartY = this.centerY + 136
    const ringOffsetY = -10

    this.tweens.add({
      targets: this.ring,
      y: ringStartY + ringOffsetY,
      ease: 'Linear',
      repeat: 0,
      yoyo: true,
      duration: 20,
      onComplete: () => {
        this.ring.y = ringStartY
      }
    })
  }
  targetCollideControl (ball, pin) {
    if(ball.depth === 20) return false
  }
  goal() {
    if (this.isPinCollide) {
      this.scoreCount += 2
      this.sounds.dirty_goal.play()
      this.clearCount = null
      this.clearCounter.setText(this.clearCount)
    } else {
      this.scoreCount += 3
      this.sounds.clean_goal.play()
      this.clearCount++
      this.clearCounter.setText(this.clearCount > 1 ? `x${this.clearCount}` : null)
    }
    this.isGoal = true
    this.isPinCollide = false

    this.sounds.bell.play()

    this.ball.body.velocity.y = this.ball.body.velocity.y / 5
    this.tweens.add({
      targets: this.ball,
      x: this.ballStartPointX,
      ease: 'Linear',
      duration: 100,
      onComplete: () => {
        this.ball.body.velocity.y = 0
      }
    })

    this.updateCount()
  }
  updateCount() {
    this.basketCount++
    this.basketCounter.setText(this.basketCount)
    this.game.data.basketCount = this.basketCount
    this.scoreCounter.setText(this.scoreCount)
    if(this.scoreCount > this.recordCount) {
      this.recordCount = this.scoreCount
      this.recordCounter.setText(this.recordCount)
    }
    this.game.saveUserData()
  }
  resetCount() {
    if (this.scoreCount > 0) this.sounds.aaaaa.play()
    this.scoreCount = null
    this.scoreCounter.setText(this.scoreCount)
    this.clearCount = null
    this.clearCounter.setText(this.clearCount)
  }
  update() {
    if (
      this.isBallMove
      && this.ball.body.velocity.y > 0
      && this.ball.y > this.ballStartPointY - 300
    ) {
      this.ballReset()
    }
    if (
      this.ball.depth === 20
      && this.ball.body.velocity.y > 0
      && this.ball.y < this.ring.y - this.ballRadius
    ) {
      this.ball.depth = 5
    }

    const delta = this.ballStartPointY - this.ball.y
    const ballScale = 1 - delta / 1500

    if (delta > 0) {
      if (delta < 500 && ballScale < this.ball.scale) this.ball.setScale(ballScale)
      if (delta < 200) this.ballShadow.setAlpha(1 - delta/200)
    }
    this.ballShadow.x = this.ball.x
    if(
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
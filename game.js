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
        {x: -68, y: 30},
        {x: -35, y: 30},
        {x: 35, y: 30},
        {x: 68, y: 30},

      ],
      [
        {x: -50, y: 41},
        {x: 0, y: 41},
        {x: 50, y: 41}
      ],
      [
        {x: -58, y: 59},
        {x: -26, y: 59},
        {x: 26, y: 59},
        {x: 58, y: 59},

      ],
      [
        {x: -50, y: 79},
        {x: 0, y: 79},
        {x: 50, y: 79}
      ],
      [
        {x: -48, y: 97},
        {x: -28, y: 97},
        {x: 28, y: 97},
        {x: 48, y: 97}
      ],
      [
        {x: -46, y: 115},
        {x: 0, y: 115},
        {x: 46, y: 115}
      ],
    ]

    this.basketNet = basketNetPoints.map(row => row.map(({x,y}) => {
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
      this.matter.add.constraint(
            start,
            end,
            distance,1,
            {
              render: {
                lineColor: 0xffffff,
                lineThickness,
                visible: true
              }
            }
          )
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
            const start = this.basketNet[rowIndex][pointIndex]
            const endPoints = [
              this.basketNet[rowIndex-1][pointIndex],
              this.basketNet[rowIndex-1][pointIndex+1],
              this.basketNet[rowIndex+1][pointIndex],
              this.basketNet[rowIndex+1][pointIndex+1],
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
      targets: [this.ring, ...this.basketNet[0].map(point => point.position)],
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
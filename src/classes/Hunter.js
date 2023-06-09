import Phaser from 'phaser'

export default class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, bulletGroup, bulletSpeed, centerPoint) {
    super(scene, x, y, "hunter");
    this.setScale(1);
    this.setDepth(2)
    this.centerPoint = centerPoint

    this.bulletGroup = bulletGroup;
    this.bulletSpeed = bulletSpeed;

    this.createAnimations()
    scene.add.existing(this)
  }

  shoot() {
    let bullet = this.bulletGroup.get();
    if (bullet) {
      const deviateX = Phaser.Math.FloatBetween(0.90, 1.1)
      const deviateY = Phaser.Math.FloatBetween(0.90, 1.1)
      bullet.fire(
        this.x,
        this.y,
        Phaser.Math.RadToDeg(
          Phaser.Math.Angle.Between(this.x, this.y, this.centerPoint.x * deviateX, this.centerPoint.y * deviateY)
        ),
        0,
        10,
        this.bulletSpeed
      );
    }
  }

  update() {
    this.setAngle(
      Phaser.Math.RadToDeg(
        Phaser.Math.Angle.Between(this.x, this.y, this.centerPoint.x, this.centerPoint.y)
      ) - 90
    )
  }

  createAnimations() {
    if (!this.scene.anims.exists('hunter-idle')) {
      this.scene.anims.create({
        key: 'hunter-idle',
        frames: this.anims.generateFrameNumbers('hunter', {
          start: 0,
          end: 0
        }),
        repeat: 0
      })
    }

    if (!this.scene.anims.exists('hunter-walking-sideways')) {
      this.scene.anims.create({
        key: 'hunter-walking-sideways',
        frames: this.anims.generateFrameNumbers('hunter', {
          start: 0,
          end: 1
        }),
        frameRate: 4,
        repeat: -1
      })
    }

    if (!this.scene.anims.exists('hunter-walking-inwards')) {
      this.scene.anims.create({
        key: 'hunter-walking-inwards',
        frames: this.anims.generateFrameNumbers('hunter', {
          start: 0,
          end: 1
        }),
        frameRate: 8,
        repeat: -1
      })
    }
  }
}
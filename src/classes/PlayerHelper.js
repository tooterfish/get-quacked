import Phaser from "phaser";
import Player from './Player'
import PlayerBullet from "./PlayerBullet";
import Shields from "./Shields";

export default class PlayerHelper {
  constructor(scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard.createCursorKeys();
  }

  setupPlayer() {
    const bulletGroup = this.scene.physics.add.group({
      classType: PlayerBullet,
      maxSize: 1,
      runChildUpdate: true,
    });
    this.player = new Player(this.scene, 400, 300, 'duck', bulletGroup)
    const playerGroup = this.scene.physics.add.group(this.player)
    this.player.body.setSize(450, 450)
    this.scene.add.existing(this.player)

    const shieldCircle = new Phaser.Geom.Circle(400, 300, 100);
    const shieldGroup = this.scene.physics.add.group()
    this.shields = []
    for (let i = 0; i < 5; i++) {
      const shield = new Shields(this.scene)
      shield.setDepth(2)
      this.scene.add.existing(shield)
      this.shields.push(shield)
    }
    Phaser.Actions.PlaceOnCircle(this.shields, shieldCircle)
    shieldGroup.addMultiple(this.shields)

    return [this.player, playerGroup, bulletGroup, shieldGroup]
  }

  movePlayer() {
    if (this.cursors.left.isDown) {
      this.player.angle -= 2;
    }

    if (this.cursors.right.isDown) {
      this.player.angle += 2;
    }

    if (this.cursors.space.isDown) {
      this.player.shoot();
    }
    if (this.cursors.up.isDown) {
      Phaser.Actions.RotateAroundDistance(
        this.shields,
        { x: 400, y: 300 },
        -0.015,
        100
      );
    }
    if (this.cursors.down.isDown) {
      Phaser.Actions.RotateAroundDistance(
        this.shields,
        { x: 400, y: 300 },
        +0.015,
        100
      );
    }
  }
}
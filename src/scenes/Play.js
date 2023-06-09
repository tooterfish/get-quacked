import Phaser from "phaser";

import Health from "../classes/Health";
import EnemyHelper from "../classes/EnemyHelper";
import PlayerHelper from "../classes/PlayerHelper";
import PauseScene from "./Pause";
import { score, round, updateScore, incrementRound } from "./PrePlay";

export default class Play extends Phaser.Scene {
  constructor() {
    super({
      key: "play",
    });
  }

  create() {
    // this.scene.add("pause", PauseScene);
    let pauseBtn = this.add.image(90, 550, "pause").setDepth(10);
    pauseBtn.setInteractive();
    pauseBtn.on("pointerdown", function () {
      this.scene.scene.pause("play");
      this.scene.scene.launch("pause");
    });
    pauseBtn.setScale(0.2);

    let pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    pKey.on("down", () => {
      this.scene.pause("play");
      this.scene.launch("pause");
    });

    this.input.keyboard.enabled = true;

    this.isActive = true;

    //health bar setup
    this.health = new Health(this);

    //quack sound
    this.quack = this.sound.add("quacksound", {
      volume: 0.3,
    });

    //explosion sound
    this.explosion = this.sound.add("explosionsound", {
      volume: 0.3,
    });

    //getting hit sound
    this.oof = this.sound.add("oof", {
      volume: 0.3,
    });

    this.clink = this.sound.add("clink", {
      volume: 0.4,
    });

    //enemy setup
    this.enemyHelper = new EnemyHelper(this, round);
    let [hunterGroups, hunterBulletGroup] = this.enemyHelper.setupEnemies();
    this.hunters = hunterGroups;
    this.hunterBulletGroup = hunterBulletGroup;

    //player setup
    this.playerHelper = new PlayerHelper(this);
    let [playerGroup, playerBulletGroup, shieldGroup] =
      this.playerHelper.setupPlayer();
    this.playerGroup = playerGroup;
    this.playerBulletGroup = playerBulletGroup;
    this.shieldGroup = shieldGroup;

    //round
    this.roundText = this.add
      .text(600, 520, `Round ${round}`, {
        fontSize: 24,
      })
      .setDepth(10);

    //score
    this.scoreText = this.add
      .text(600, 20, `Score: ${score}`, {
        fontSize: 24,
      })
      .setDepth(10);

    //background
    let bgImage = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "background"
    );
    bgImage.setScale(1).setScrollFactor(0);

    // Random hunter selected to shoot at random time
    const shootDelay = 3000 - 200 * round;
    this.time.addEvent({
      delay: Phaser.Math.Between(shootDelay - 100, shootDelay + 100),
      loop: true,
      callback: () => {
        if (this.isActive) {
          if (this.enemyHelper.getEnemiesLeft() > 0) {
            this.enemyHelper.getRandomEnemy().shoot();
          }
        }
      },
      callbackScope: this,
    });

    // player bullet and hunter interaction
    this.physics.add.overlap(
      this.playerBulletGroup,
      this.hunters,
      this.handleEnemyHit,
      null,
      this
    );

    // hunter bullet collide with player interaction
    this.physics.add.overlap(
      this.playerGroup,
      this.hunterBulletGroup,
      this.handlePlayerHit,
      null,
      this
    );

    // explosion animation
    const explosion = {
      key: "explode",
      frames: "boom",
      hideOnComplete: true,
    };
    this.anims.create(explosion);

    // player bullet and shield interaction
    this.physics.add.overlap(
      this.playerBulletGroup,
      this.shieldGroup,
      this.handleShieldCollision,
      null,
      this
    );

    //hunter bullet and shield interaction
    this.physics.add.overlap(
      this.hunterBulletGroup,
      this.shieldGroup,
      this.handleShieldCollision,
      null,
      this
    );

    //hunter and shield interaction
    this.physics.add.overlap(
      this.hunters,
      this.shieldGroup,
      (hunter, shield) => {
        this.health.setToZero();
        this.playerHelper.player.die();
        this.isActive = false;
        this.time.delayedCall(2000, () => this.scene.start("gameover"));
      },
      null,
      this
    );
  }

  handlePlayerHit(player, hunterBullet) {
    hunterBullet.destroy();
    this.oof.play();

    if (player.hit(this.health)) {
      this.explosion.play();
      this.isActive = false;
      this.time.delayedCall(2000, () => this.scene.start("gameover"));
    }
  }

  handleEnemyHit(playerBullet, hunter) {
    const newScore = updateScore(100);
    this.scoreText.setText(`Score: ${newScore}`);
    playerBullet.destroy();
    this.add.sprite(hunter.x, hunter.y, "boom").play("explode");
    hunter.isAlive = false;
    this.quack.play();
    hunter.destroy();
  }

  handleShieldCollision(bullet, shield) {
    bullet.destroy();
    this.clink.play();
    shield.hit();
  }

  update() {
    if (this.isActive) {
      this.enemyHelper.moveEnemies();
      this.playerHelper.movePlayer();
    }

    if (this.enemyHelper.getEnemiesLeft() === 0) {
      this.time.addEvent({
        delay: 1000,
        loop: false,
        callback: () => {
          incrementRound();
          this.scene.restart();
        },
      });
    }
  }
}

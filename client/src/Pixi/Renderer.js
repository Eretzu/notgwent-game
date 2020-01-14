import Core from '@/Pixi/Core';
import * as PIXI from 'pixi.js';
import Constants from '@/shared/Constants';
import { TargetingMode } from '@/Pixi/enums/TargetingMode';
import GameTurnPhase from '@/shared/enums/GameTurnPhase';
export default class Renderer {
    constructor(container) {
        this.GAME_BOARD_WINDOW_FRACTION = 0.6;
        this.PLAYER_HAND_WINDOW_FRACTION = 0.15;
        this.OPPONENT_HAND_WINDOW_FRACTION = 0.15;
        this.HOVERED_HAND_WINDOW_FRACTION = 0.3;
        this.GAME_BOARD_ROW_WINDOW_FRACTION = this.GAME_BOARD_WINDOW_FRACTION / Constants.GAME_BOARD_ROW_COUNT;
        this.pixi = new PIXI.Application({
            width: window.innerWidth * window.devicePixelRatio,
            height: window.innerHeight * window.devicePixelRatio,
            antialias: true,
            autoDensity: true,
            resolution: 1
        });
        this.pixi.stage.sortableChildren = true;
        container.appendChild(this.pixi.view);
        this.container = container;
        /* Player name label */
        this.playerNameLabel = new PIXI.Text('', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF
        });
        this.playerNameLabel.anchor.set(0, 1);
        this.playerNameLabel.position.set(10, this.getScreenHeight() - 10);
        this.pixi.stage.addChild(this.playerNameLabel);
        /* Opponent player name */
        this.opponentNameLabel = new PIXI.Text('', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF
        });
        this.opponentNameLabel.position.set(10, 10);
        this.pixi.stage.addChild(this.opponentNameLabel);
        /* Time label */
        this.timeLabel = new PIXI.Text('', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF
        });
        this.timeLabel.anchor.set(0, 0.5);
        this.timeLabel.position.set(10, this.getScreenHeight() / 2);
        this.pixi.stage.addChild(this.timeLabel);
        /* Register the ticker */
        PIXI.Ticker.shared.add(() => this.tick());
    }
    tick() {
        const playerCards = Core.player.cardHand.cards;
        const sortedPlayerCards = Core.player.cardHand.cards.slice().reverse();
        sortedPlayerCards.forEach(renderedCard => {
            if (Core.input.grabbedCard && renderedCard === Core.input.grabbedCard.card) {
                this.renderCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length);
                this.renderGrabbedCard(renderedCard, Core.input.mousePosition);
            }
            else if (!Core.input.grabbedCard && Core.input.hoveredCard && renderedCard === Core.input.hoveredCard.card) {
                this.renderHoveredCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length);
            }
            else {
                this.renderCardInHand(renderedCard, playerCards.indexOf(renderedCard), playerCards.length);
            }
        });
        if (Core.opponent) {
            const opponentCards = Core.opponent.cardHand.cards;
            const sortedOpponentCards = Core.opponent.cardHand.cards.slice().reverse();
            sortedOpponentCards.forEach(renderedCard => {
                this.renderCardInOpponentHand(renderedCard, opponentCards.indexOf(renderedCard), opponentCards.length);
            });
        }
        this.renderTextLabels();
        this.renderGameBoard(Core.board);
        this.renderTargetingArrow();
        this.renderQueuedAttacks();
        this.renderInspectedCard();
    }
    registerCard(card) {
        this.pixi.stage.addChild(card.sprite);
        this.pixi.stage.addChild(card.hitboxSprite);
    }
    unregisterCard(card) {
        this.pixi.stage.removeChild(card.sprite);
        this.pixi.stage.removeChild(card.hitboxSprite);
    }
    registerGameBoardRow(row) {
        this.pixi.stage.addChild(row.sprite);
    }
    getScreenWidth() {
        return this.pixi.view.width;
    }
    getScreenHeight() {
        return this.pixi.view.height;
    }
    renderSpriteInHand(sprite, handPosition, handSize, isOpponent) {
        const windowFraction = isOpponent ? this.OPPONENT_HAND_WINDOW_FRACTION : this.PLAYER_HAND_WINDOW_FRACTION;
        const cardHeight = this.getScreenHeight() * windowFraction;
        sprite.scale.set(cardHeight / sprite.texture.height);
        const screenCenter = this.getScreenWidth() / 2;
        const cardWidth = sprite.width * Math.pow(0.95, handSize);
        const distanceToCenter = handPosition - ((handSize - 1) / 2);
        sprite.alpha = 1;
        sprite.position.x = distanceToCenter * cardWidth + screenCenter;
        sprite.position.y = cardHeight * 0.5;
        sprite.rotation = 0;
        sprite.zIndex = (handPosition + 1) * 2;
        if (!isOpponent) {
            sprite.position.y = this.getScreenHeight() - sprite.position.y;
        }
    }
    renderHoveredSpriteInHand(sprite, handPosition, handSize) {
        const cardHeight = this.getScreenHeight() * this.HOVERED_HAND_WINDOW_FRACTION;
        sprite.scale.set(cardHeight / sprite.texture.height);
        const spriteNormalWidth = (this.getScreenHeight() * this.PLAYER_HAND_WINDOW_FRACTION) * (sprite.texture.width / sprite.texture.height);
        const screenCenter = this.getScreenWidth() / 2;
        const cardWidth = spriteNormalWidth * Math.pow(0.95, handSize);
        const distanceToCenter = handPosition - ((handSize - 1) / 2);
        sprite.alpha = 1;
        sprite.position.x = distanceToCenter * cardWidth + screenCenter;
        sprite.position.y = this.getScreenHeight() - cardHeight * 0.5;
        sprite.rotation = 0;
        sprite.zIndex = 50;
    }
    renderGrabbedSprite(sprite, mousePosition) {
        const cardHeight = this.getScreenHeight() * this.PLAYER_HAND_WINDOW_FRACTION;
        sprite.scale.set(cardHeight / sprite.texture.height);
        sprite.alpha = 1;
        sprite.position.x = mousePosition.x;
        sprite.position.y = mousePosition.y;
        sprite.rotation = 0;
        sprite.zIndex = 100;
    }
    renderCardInHand(renderedCard, handPosition, handSize) {
        const sprite = renderedCard.sprite;
        const hitboxSprite = renderedCard.hitboxSprite;
        this.renderSpriteInHand(sprite, handPosition, handSize, false);
        this.renderSpriteInHand(hitboxSprite, handPosition, handSize, false);
        hitboxSprite.zIndex -= 1;
    }
    renderHoveredCardInHand(renderedCard, handPosition, handSize) {
        const sprite = renderedCard.sprite;
        const hitboxSprite = renderedCard.hitboxSprite;
        this.renderHoveredSpriteInHand(sprite, handPosition, handSize);
        this.renderSpriteInHand(hitboxSprite, handPosition, handSize, false);
        hitboxSprite.zIndex -= 1;
    }
    renderGrabbedCard(renderedCard, mousePosition) {
        this.renderGrabbedSprite(renderedCard.sprite, mousePosition);
    }
    renderCardInOpponentHand(renderedCard, handPosition, handSize) {
        const sprite = renderedCard.sprite;
        const hitboxSprite = renderedCard.hitboxSprite;
        this.renderSpriteInHand(sprite, handPosition, handSize, true);
        this.renderSpriteInHand(hitboxSprite, handPosition, handSize, true);
        hitboxSprite.zIndex -= 1;
    }
    renderTextLabels() {
        const phase = Core.game.turnPhase === GameTurnPhase.DEPLOY ? 'Deploy' : 'Combat';
        this.timeLabel.text = `Turn phase is ${phase}\nTime of day is ${Core.game.currentTime} out of ${Core.game.maximumTime}`;
        this.playerNameLabel.text = `${Core.player.player.username}\nTime units available: ${Core.player.timeUnits}`;
        if (Core.opponent) {
            this.opponentNameLabel.text = `${Core.opponent.player.username}\nTime units available: ${Core.opponent.timeUnits}`;
        }
    }
    renderGameBoard(gameBoard) {
        let rows = gameBoard.rows.slice();
        if (gameBoard.isInverted) {
            rows = rows.reverse();
        }
        for (let i = 0; i < rows.length; i++) {
            this.renderGameBoardRow(rows[i], i);
        }
    }
    renderGameBoardRow(gameBoardRow, rowIndex) {
        const sprite = gameBoardRow.sprite;
        const rowHeight = this.getScreenHeight() * this.GAME_BOARD_ROW_WINDOW_FRACTION;
        sprite.scale.set(rowHeight / sprite.texture.height);
        const screenCenterX = this.getScreenWidth() / 2;
        const screenCenterY = this.getScreenHeight() / 2;
        const verticalDistanceToCenter = rowIndex - Constants.GAME_BOARD_ROW_COUNT / 2 + 0.5;
        const rowY = screenCenterY + verticalDistanceToCenter * rowHeight;
        sprite.alpha = 1;
        sprite.position.set(screenCenterX, rowY);
        for (let i = 0; i < gameBoardRow.cards.length; i++) {
            const cardOnBoard = gameBoardRow.cards[i];
            this.renderCardOnBoard(cardOnBoard, rowY, i, gameBoardRow.cards.length);
        }
    }
    renderCardOnBoard(cardOnBoard, rowY, unitIndex, unitCount) {
        const sprite = cardOnBoard.card.sprite;
        const hitboxSprite = cardOnBoard.card.hitboxSprite;
        const screenCenterX = this.getScreenWidth() / 2;
        const distanceToCenter = unitIndex - unitCount / 2 + 0.5;
        const rowHeight = this.getScreenHeight() * this.GAME_BOARD_ROW_WINDOW_FRACTION;
        sprite.scale.set(rowHeight / sprite.texture.height);
        hitboxSprite.scale.copyFrom(sprite.scale);
        sprite.alpha = 1;
        sprite.position.x = screenCenterX + distanceToCenter * hitboxSprite.width;
        sprite.position.y = rowY;
        sprite.zIndex = 1;
        sprite.tint = 0xFFFFFF;
        if (Core.input.hoveredCard && cardOnBoard.card === Core.input.hoveredCard.card) {
            sprite.tint = 0xBFBFBF;
        }
        if (Core.game.turnPhase === GameTurnPhase.SKIRMISH && cardOnBoard.owner === Core.player) {
            sprite.tint = 0xBBFFBB;
            if (Core.input.grabbedCard && cardOnBoard.card === Core.input.grabbedCard.card) {
                sprite.tint = 0x99BB99;
            }
            else if (Core.input.hoveredCard && cardOnBoard.card === Core.input.hoveredCard.card) {
                sprite.tint = 0x4CFE4C;
            }
        }
        hitboxSprite.alpha = sprite.alpha;
        hitboxSprite.position.copyFrom(sprite.position);
        hitboxSprite.zIndex = sprite.zIndex - 1;
    }
    renderTargetingArrow() {
        const grabbedCard = Core.input.grabbedCard;
        if (!grabbedCard || grabbedCard.targetingMode !== TargetingMode.CARD_ATTACK) {
            return;
        }
        const targetingArrow = grabbedCard.targetingArrow;
        const startingPosition = grabbedCard.card.hitboxSprite.position;
        const targetPosition = Core.input.mousePosition;
        targetingArrow.startingPoint.position.copyFrom(startingPosition);
        targetingArrow.startingPoint.clear();
        targetingArrow.startingPoint.beginFill(0xFFFF00, 0.8);
        targetingArrow.startingPoint.drawCircle(0, 0, 5);
        targetingArrow.startingPoint.endFill();
        targetingArrow.startingPoint.zIndex = 100;
        targetingArrow.arrowLine.position.copyFrom(startingPosition);
        targetingArrow.arrowLine.clear();
        targetingArrow.arrowLine.lineStyle(2, 0xFFFF00, 0.8);
        targetingArrow.arrowLine.lineTo(targetPosition.x - startingPosition.x, targetPosition.y - startingPosition.y);
        targetingArrow.arrowLine.zIndex = 100;
        targetingArrow.targetPoint.position.copyFrom(targetPosition);
        targetingArrow.targetPoint.clear();
        targetingArrow.targetPoint.beginFill(0xFFFF00, 0.8);
        targetingArrow.targetPoint.drawCircle(0, 0, 5);
        targetingArrow.targetPoint.endFill();
        targetingArrow.targetPoint.zIndex = 100;
    }
    renderQueuedAttacks() {
        Core.board.queuedAttacks.forEach(attack => {
            const targetingArrow = attack.targetingArrow;
            const startingPosition = attack.attacker.card.getPosition();
            const targetPosition = attack.target.card.getPosition();
            targetingArrow.startingPoint.position.copyFrom(startingPosition);
            targetingArrow.startingPoint.clear();
            targetingArrow.startingPoint.beginFill(0x999999, 1.0);
            targetingArrow.startingPoint.drawCircle(0, 0, 5);
            targetingArrow.startingPoint.endFill();
            targetingArrow.startingPoint.zIndex = 99;
            targetingArrow.arrowLine.position.copyFrom(startingPosition);
            targetingArrow.arrowLine.clear();
            targetingArrow.arrowLine.lineStyle(2, 0x999999, 1.0);
            targetingArrow.arrowLine.lineTo(targetPosition.x - startingPosition.x, targetPosition.y - startingPosition.y);
            targetingArrow.arrowLine.zIndex = 99;
            targetingArrow.targetPoint.position.copyFrom(targetPosition);
            targetingArrow.targetPoint.clear();
            targetingArrow.targetPoint.beginFill(0x999999, 1.0);
            targetingArrow.targetPoint.drawCircle(0, 0, 5);
            targetingArrow.targetPoint.endFill();
            targetingArrow.targetPoint.zIndex = 99;
        });
    }
    renderInspectedCard() {
        const inspectedCard = Core.input.inspectedCard;
        if (!inspectedCard) {
            return;
        }
        const sprite = inspectedCard.sprite;
        sprite.tint = 0xFFFFFF;
        sprite.scale.set(1.0);
        sprite.alpha = 1;
        sprite.position.x = this.getScreenWidth() / 2;
        sprite.position.y = this.getScreenHeight() / 2;
        sprite.zIndex = 100;
    }
    destroy() {
        this.pixi.stop();
        this.container.removeChild(this.pixi.view);
    }
}
//# sourceMappingURL=Renderer.js.map
class Obstacle {
  // Constructeur de la classe avec des paramètres x, y et r
  constructor(x, y, r) {
    // Création d'un vecteur de position avec les coordonnées x et y
    this.pos = createVector(x, y);
    
    // Attribution d'un rayon à l'obstacle
    this.r = r;
    
    // Attribution de la couleur rose par défaut à l'obstacle
    this.color = color('#3E8EDE');
  }

  // Méthode pour afficher l'obstacle
  show() {
    // Sauvegarde de l'état graphique actuel
    push();
    
    // Remplissage de la forme avec la couleur définie pour l'obstacle 
    fill(this.color);
    
    // Définition de la couleur des contours en gris
    stroke('#AFDBF5');
    
    // Définition de l'épaisseur des contours
    strokeWeight(2);
    
    // Dessin d'une étoile à la position spécifiée avec une taille égale au double du rayon de l'obstacle
    drawStar(this.pos.x, this.pos.y, this.r * 1, this.r * 1);
    
    // Remplissage d'un petit cercle noir au centre de l'obstacle
    fill(0);
    ellipse(this.pos.x, this.pos.y, 5);
    
    // Restauration de l'état graphique précédent
    pop();
  }
}

// Fonction pour dessiner une étoile
function drawStar(x, y, radius1, radius2) {
  let angle = TWO_PI / 5;
  let halfAngle = angle / 0.5;
  beginShape();
  for (let a = -PI / 2; a < TWO_PI - PI / 2; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}
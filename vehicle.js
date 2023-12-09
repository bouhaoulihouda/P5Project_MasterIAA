// Fonction pour trouver la projection d'un point 'pos' sur la ligne définie par les points 'a' et 'b'
function findProjection(pos, a, b) {
  // Calcul du vecteur v1 qui va du point 'pos' au point 'a'
  let v1 = p5.Vector.sub(a, pos);

  // Calcul du vecteur v2 qui va du point 'pos' au point 'b'
  let v2 = p5.Vector.sub(b, pos);

  // Normalisation du vecteur v2 pour le transformer en vecteur unitaire
  v2.normalize();

  // Calcul du produit scalaire entre v1 et v2 pour trouver la projection
  let sp = v1.dot(v2);

  // Multiplication du vecteur v2 par la valeur de la projection
  v2.mult(sp);

  // Ajout du vecteur résultant à la position initiale pour obtenir la projection sur la ligne
  v2.add(pos);

  // Retourne la position de la projection sur la ligne
  return v2;
}

  
  // Définition de la classe Vehicle
class Vehicle {
  // Propriété statique pour activer ou désactiver le mode de débogage
  static debug = false;

  // Constructeur de la classe, initialise les propriétés du véhicule
  constructor(x, y) {
      // Position actuelle du véhicule (vecteur)
      this.pos = createVector(x, y);

      // Vitesse actuelle du véhicule (vecteur)
      this.vel = createVector(0, 0);

      // Accélération du véhicule (vecteur)
      this.acc = createVector(0, 0);

      // Vitesse maximale que le véhicule peut atteindre
      this.maxSpeed = 6;

      // Force maximale appliquée au véhicule
      this.maxForce = 0.9;

      // Couleur du véhicule
      this.color = "yellow";

      // Durée de vie approximative en secondes
      this.dureeDeVie = 5;

      // Poids appliqué lors de l'arrivée à destination
      this.weightArrive = 0.3;

      // Poids appliqué lors de l'évitement d'obstacle
      this.weightObstacle = 0.9;

      // Poids appliqué lors de la séparation des véhicules
      this.weightSeparation = 0.9;

      // Rayon utilisé pour le dessin du véhicule
      this.r_pourDessin = 8;

      // Rayon du véhicule utilisé pour l'évitement d'obstacle
      this.r = this.r_pourDessin * 2;

      // Rayon de perception autour du véhicule pour la détection d'autres véhicules
      this.perceptionRadius = 24;

      // Largeur de la zone d'évitement devant le vaisseau
      this.largeurZoneEvitementDevantVaisseau = this.r / 2;

      // Chemin que le véhicule suit (trajet derrière le vaisseau)
      this.path = [];

      // Longueur maximale du chemin
      this.pathMaxLength = 30;
  }

   // Méthode pour effectuer la dérive aléatoire (wander) du véhicule
wander() {
  // Point devant le véhicule, défini à une distance fixe devant la direction actuelle de déplacement
  let wanderPoint = this.vel.copy();
  wanderPoint.setMag(100);
  wanderPoint.add(this.pos);  

  // Rayon du cercle autour du point de dérive
  let wanderRadius = 50;

  // Angle (theta) pour déterminer la position sur le cercle de dérive
  let theta = this.wanderTheta + this.vel.heading();

  // Calcul des coordonnées (x, y) sur le cercle de dérive
  let x = wanderRadius * cos(theta);
  let y = wanderRadius * sin(theta);

  // Ajout des coordonnées au point de dérive
  wanderPoint.add(x, y);

  // Calcul de la force de direction vers le point de dérive
  let steer = wanderPoint.sub(this.pos);

  // Normalisation et application de la force maximale
  steer.setMag(this.maxForce);
  this.applyForce(steer);

  // Paramètres pour la variation aléatoire de la dérive
  this.displaceRange = 0.3;
  this.wanderTheta += random(-this.displaceRange, this.displaceRange);
}

  // Méthode pour appliquer les comportements seek et avoid
applyBehaviors(target, obstacles, vehicles) {
  // Force résultante de l'approche de la cible
  let arriveForce = this.arrive(target);

  // Force résultante de l'évitement d'obstacles amélioré
  let avoidForce = this.avoidAmeliore(obstacles, vehicles, false);

  // Force résultante de la séparation entre les véhicules
  let separationForce = this.separation(vehicles);

  // Application des poids à chaque force résultante
  arriveForce.mult(this.weightArrive);
  avoidForce.mult(this.weightObstacle);
  separationForce.mult(this.weightSeparation);

  // Application des forces résultantes
  this.applyForce(arriveForce);
  this.applyForce(avoidForce);
  this.applyForce(separationForce);
}

    // Méthode pour appliquer la séparation entre les véhicules
separation(vehicles) {
  // Vecteur de direction résultant de la séparation
  let steering = createVector();

  // Compteur pour suivre le nombre de véhicules pris en compte dans la séparation
  let total = 0;

  // Parcours de tous les autres véhicules
  for (let other of vehicles) {
      // Calcul de la distance entre ce véhicule et les autres
      let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);

      // Vérification si l'autre véhicule n'est pas celui-ci et est dans la perceptionRadius
      if (other != this && d < this.perceptionRadius) {
          // Calcul du vecteur différence et ajustement par inverse carré de la distance
          let diff = p5.Vector.sub(this.pos, other.pos);
          diff.div(d * d);

          // Addition du vecteur différence au vecteur de direction résultant
          steering.add(diff);

          // Incrémentation du compteur
          total++;
      }
  }

  // S'il y a au moins un autre véhicule pris en compte
  if (total > 0) {
      // Calcul de la moyenne des vecteurs de direction
      steering.div(total);

      // Normalisation et ajustement à la vitesse maximale
      steering.setMag(this.maxSpeed);

      // Soustraction de la vélocité actuelle
      steering.sub(this.velocity);

      // Limitation à la force maximale
      steering.limit(this.maxForce);
  }

  // Retourne le vecteur de direction résultant
  return steering;
}
/*
  La méthode avoidAmeliore gère l'évitement amélioré des obstacles.
  Elle utilise deux vecteurs ahead et ahead2 pour définir deux zones d'évitement.
  Ces vecteurs sont adaptés à la vitesse du véhicule pour permettre de regarder plus loin à grande vitesse.
  Si le mode de débogage (Vehicle.debug) est activé, les vecteurs sont dessinés à des fins de suivi.

*/
    avoidAmeliore(obstacles, vehicules, vehiculesAsObstacles = false) {
      // Calcul du vecteur ahead devant le véhicule
      let ahead = this.vel.copy();
      ahead.normalize();
      ahead.mult(20 * this.vel.mag() * 0.8);
      // Deuxième vecteur deux fois plus petit
      let ahead2 = ahead.copy();
      ahead2.mult(0.5);
      // Dessin des vecteurs ahead et ahead2 pour le débogage
      if (Vehicle.debug) {
        this.drawVector(this.pos, ahead, "white");
        this.drawVector(this.pos, ahead2, "pink");
      }
      // Detection de l'obstacle le plus proche
      let obstacleLePlusProche = this.getObstacleLePlusProche(obstacles);
      let vehiculeLePlusProche = this.getVehiculeLePlusProche(vehicules);
      let pointAuBoutDeAhead = p5.Vector.add(this.pos, ahead);
      let pointAuBoutDeAhead2 = p5.Vector.add(this.pos, ahead2);
      // Dessin du point au bout de ahead pour le débogage
      if (Vehicle.debug) {
        fill("#00693E");
        noStroke();
        circle(pointAuBoutDeAhead.x, pointAuBoutDeAhead.y, 20);
        stroke(color('#FFC72C')); // gros, semi transparent
        strokeWeight(this.largeurZoneEvitementDevantVaisseau);
        line(this.pos.x, this.pos.y, pointAuBoutDeAhead.x, pointAuBoutDeAhead.y);
      }
      // Calcul des distances aux points de référence
      let distance1 = pointAuBoutDeAhead.dist(obstacleLePlusProche.pos);
      let distance2 = pointAuBoutDeAhead2.dist(obstacleLePlusProche.pos);
      let distance3 = this.pos.dist(obstacleLePlusProche.pos);
      let distance4 = Infinity;
      if(vehiculeLePlusProche) {
        distance4 = this.pos.dist(vehiculeLePlusProche.pos);
      } 
      // Sélection de la plus petite distance
      let plusPetiteDistance = min(distance1, distance2);
      plusPetiteDistance = min(plusPetiteDistance, distance3);
      // Point de référence = point au bout de ahead, de ahead2 ou pos
      let pointDeReference;
      if (distance1 < distance2) {
        pointDeReference = pointAuBoutDeAhead;
      } else {
        pointDeReference = pointAuBoutDeAhead2;
      }
      if ((distance3 < distance1) && (distance3 < distance2)) {
        pointDeReference = this.pos;
      }
      // Alerte rouge si vaisseau dans obstacle
      let alerteRougeVaisseauEnCollisionAvecObstacleLePlusProche = (distance3 < obstacleLePlusProche.r);
       // Considération des véhicules comme obstacles si activé
      if(vehiculesAsObstacles) {
        if (!alerteRougeVaisseauEnCollisionAvecObstacleLePlusProche) {
          let distanceAvecVehiculeLePlusProche = distance4;
          let distanceAvecObstacleLePlusProche = distance3;
    
          if (distanceAvecVehiculeLePlusProche < distanceAvecObstacleLePlusProche) {
            obstacleLePlusProche = vehiculeLePlusProche;
            plusPetiteDistance = distanceAvecVehiculeLePlusProche;
          }
        }
      }
      // Vérification de la collision possible
      if (plusPetiteDistance < obstacleLePlusProche.r + this.largeurZoneEvitementDevantVaisseau) {
        obstacleLePlusProche.color = "#7CEEB";
        let force = p5.Vector.sub(pointDeReference, obstacleLePlusProche.pos);
        // Dessin du vecteur de force pour le débog
        if (Vehicle.debug) {
          this.drawVector(obstacleLePlusProche.pos, force, "#87CEEB");
        }

        force.setMag(this.maxSpeed);
        force.sub(this.vel);
        force.limit(this.maxForce);
        if (alerteRougeVaisseauEnCollisionAvecObstacleLePlusProche) {
          force.setMag(this.maxForce * 2);
        }
        return force;
      } else {

        obstacleLePlusProche.color = "#7CEEB";
        return createVector(0, 0);
      }
    }
    avoidHead(leader, vehicles, f) {
    // Suivi du leader
    let followLeaderForce = this.seek(leader);
    followLeaderForce.mult(0.2);
    this.applyForce(followLeaderForce);

    // Séparation avec les autres véhicules
    let separationForce = this.separate(vehicles);
    separationForce.mult(0.3);
    this.applyForce(separationForce);

    // Évasion si devant le leader
    let ahead = this.pos.copy();
    ahead.add(p5.Vector.mult(this.vel.copy().normalize(), 25));
    let threat = p5.Vector.sub(leader.pos, this.pos);
    let distanceToLeader = threat.mag();
    threat.normalize();
    let dotProduct = threat.dot(this.vel);

    // Éviter le leader si devant
    if (dotProduct > 0 && dotProduct < distanceToLeader / 2 && distanceToLeader < 100) {
      let evadeForce = this.seek(ahead, false); // Éviter en se dirigeant vers l'avant
      evadeForce.mult(0.5);
      this.applyForce(evadeForce);
    }

    // Cercle devant le leader (fuite du centre du cercle)
    let circleCenter = leader.pos.copy();
    let fleeCircleForce = this.flee(circleCenter, 100); // 100 est le rayon du cercle
    fleeCircleForce.mult(f);
    this.applyForce(fleeCircleForce);
  }

    /*
  La fonction getObstacleLePlusProche prend en paramètre un tableau d'obstacles 
  et retourne l'obstacle le plus proche par rapport à la position actuelle du véhicule.

  Paramètres :
  - obstacles : un tableau d'objets représentant des obstacles
*/

getObstacleLePlusProche(obstacles) {
  // Initialisation de la plus petite distance à une valeur arbitrairement grande
  let plusPetiteDistance = 7000;
  // Initialisation de l'obstacle le plus proche à null
  let obstacleLePlusProche;

  // Parcours de tous les obstacles dans le tableau
  obstacles.forEach(o => {
      // Je calcule la distance entre le vaisseau et l'obstacle
      const distance = this.pos.dist(o.pos);

      // Vérification si la distance est plus petite que la plus petite distance connue
      if (distance < plusPetiteDistance) {
          // Mise à jour de la plus petite distance et de l'obstacle le plus proche
          plusPetiteDistance = distance;
          obstacleLePlusProche = o;
      }
  });

  // Retourne l'obstacle le plus proche
  return obstacleLePlusProche;
}

  /*
  La fonction getVehiculeLePlusProche prend en paramètre un tableau de véhicules 
  et retourne le véhicule le plus proche par rapport à la position actuelle du véhicule appelant.

  Paramètres :
  - vehicules : un tableau d'objets représentant des véhicules


*/
getVehiculeLePlusProche(vehicules) {
  // Initialisation de la plus petite distance à Infinity
  let plusPetiteDistance = Infinity;
  // Initialisation du véhicule le plus proche à null
  let vehiculeLePlusProche;

  // Parcours de tous les véhicules dans le tableau
  for (const v of vehicules) {
      // Vérification si le véhicule n'est pas lui-même
      if (v !== this) {
          // Je calcule la distance entre le vaisseau et le véhicule
          const distance = this.pos.dist(v.pos);

          // Vérification si la distance est plus petite que la plus petite distance connue
          if (distance < plusPetiteDistance) {
              // Mise à jour de la plus petite distance et du véhicule le plus proche
              plusPetiteDistance = distance;
              vehiculeLePlusProche = v;
          }
      }
  }
  // Retourne le véhicule le plus proche
  return vehiculeLePlusProche;
}

  
    /*
  La fonction getClosestObstacle prend en paramètre la position d'un véhicule (pos) 
  et un tableau d'obstacles, et retourne l'obstacle le plus proche de la position spécifiée.
*/

getClosestObstacle(pos, obstacles) {
  // Initialisation de l'obstacle le plus proche à null
  let closestObstacle = null;
  // Initialisation de la plus petite distance à une valeur arbitrairement grande
  let closestDistance = 10;

  // Parcours de tous les obstacles dans le tableau
  for (let obstacle of obstacles) {
      // Calcul de la distance entre la position spécifiée et l'obstacle
      let distance = pos.dist(obstacle.pos);

      // Vérification si l'obstacle actuel est plus proche que le plus proche connu
      if (closestObstacle == null || distance < closestDistance) {
          // Mise à jour de l'obstacle le plus proche et de la plus petite distance
          closestObstacle = obstacle;
          closestDistance = distance;
      }
  }
  return closestObstacle;
}

/*
La fonction arrive prend en paramètre une cible (target) et utilise le comportement d'arrivée.
Elle appelle la fonction seek avec la cible et le deuxième argument true activant le comportement d'arrivée.
*/

arrive(target) {
  // Le deuxième argument true active le comportement d'arrivée
  return this.seek(target, true);
}

  
    /*
  La fonction seek prend en paramètre une cible (target) et un indicateur d'arrivée optionnel (arrival).
  Elle calcule et retourne la force nécessaire pour se diriger vers la cible.
*/
seek(target, arrival = false) {
  // Calcul du vecteur de force en direction de la cible
  let force = p5.Vector.sub(target, this.pos);

  // Initialisation de la vitesse désirée à la vitesse maximale du véhicule
  let desiredSpeed = this.maxSpeed;

  // Si le comportement d'arrivée est activé
  if (arrival) {
      // Rayon de ralentissement pour le comportement d'arrivée
      let slowRadius = 100;

      // Calcul de la distance entre le véhicule et la cible
      let distance = force.mag();

      // Si la distance est inférieure au rayon de ralentissement
      if (distance < slowRadius) {
          // Ajustement de la vitesse désirée en fonction de la distance
          desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
      }
  }

  // Réglage de la magnitude du vecteur de force à la vitesse désirée
  force.setMag(desiredSpeed);

  // Soustraction de la vitesse actuelle du véhicule
  force.sub(this.vel);

  // Limitation de la force à la force maximale autorisée
  force.limit(this.maxForce);
  return force;
}

/*
La fonction flee prend en paramètre une cible (target) et utilise le comportement inverse de seek.
Elle calcule et retourne la force nécessaire pour fuir la cible.
*/
flee(target) {
  // Utilisation du comportement inverse de seek pour fuir la cible
  return this.seek(target).mult(-1);
} 
    /*
  La méthode pursue prend en paramètre un véhicule (vehicle) et implémente un comportement de poursuite.
  Elle calcule et retourne la force nécessaire pour poursuivre un point devant la cible véhicule.
*/
pursue(vehicle) {
  // Création d'une copie de la position du véhicule cible
  let target = vehicle.pos.copy();

  // Prédiction de la position future en utilisant la vitesse actuelle du véhicule
  let prediction = vehicle.vel.copy();
  prediction.mult(10);
  target.add(prediction);

  // Affichage d'un triangle à la position prédite pour visualiser le point devant la cible
  fill(0, 255, 0);  // Couleur verte
  triangle(target.x - 8, target.y + 8, target.x, target.y - 8, target.x + 8, target.y + 8);

  // Renvoi de la force calculée en utilisant la méthode seek pour atteindre le point prédit
  return this.seek(target);
}

/*
La méthode evade prend en paramètre un véhicule (vehicle) et utilise le comportement inverse de pursue.
Elle calcule et retourne la force nécessaire pour éviter la cible véhicule.
*/

evade(vehicle) {
  // Utilisation du comportement inverse de pursue (poursuite) pour éviter la cible
  let pursuit = this.pursue(vehicle);
  pursuit.mult(-1);

  // Renvoi de la force calculée pour éviter la cible
  return pursuit;
}

  
    // applyForce est une méthode qui permet d'appliquer une force au véhicule
    // en fait on additionne le vecteurr force au vecteur accélération
    applyForce(force) {
      this.acc.add(force);
    }
  
    update() {
      // on ajoute l'accélération à la vitesse. L'accélération est un incrément de vitesse
      // (accélératiion = dérivée de la vitesse)
      this.vel.add(this.acc);
      // on contraint la vitesse à la valeur maxSpeed
      this.vel.limit(this.maxSpeed);
      // on ajoute la vitesse à la position. La vitesse est un incrément de position, 
      // (la vitesse est la dérivée de la position)
      this.pos.add(this.vel);
  
      // on remet l'accélération à zéro
      this.acc.set(0, 0);
  
      // mise à jour du path (la trainée derrière)
      this.ajoutePosAuPath();
  
      // durée de vie
      this.dureeDeVie -= 0.01;

    }
  
    ajoutePosAuPath() {
      // on rajoute la position courante dans le tableau
      this.path.push(this.pos.copy());
  
      // si le tableau a plus de 50 éléments, on vire le plus ancien
      if (this.path.length > this.pathMaxLength) {
        this.path.shift();
      }
    }
  
    // On dessine le véhicule, le chemin etc.
    show() {
      // dessin du chemin
      this.drawPath();
      // dessin du vehicule
      this.drawVehicle();
    }
  
    drawVehicle() {
      // formes fil de fer en blanc
      stroke(144, 238, 144);
      // épaisseur du trait = 2
      strokeWeight(5);
  
      // formes pleines
      fill(random(255), 0, random(255));
  
      // sauvegarde du contexte graphique (couleur pleine, fil de fer, épaisseur du trait, 
      // position et rotation du repère de référence)
      push();
      // on déplace le repère de référence.
      translate(this.pos.x, this.pos.y);
      // et on le tourne. heading() renvoie l'angle du vecteur vitesse (c'est l'angle du véhicule)
      rotate(this.vel.heading());
  
      rectMode(CENTER);
      rect(0, 0, this.r_pourDessin * 2, this.r_pourDessin * 2);
  
      // draw velocity vector
      pop();
      this.drawVector(this.pos, this.vel, color(0, 255, 0));
  
      // triangle pour évitement entre vehicules et obstacles
      if (Vehicle.debug) {
        stroke(255);
        noFill();
        // Dessiner un triangle au lieu d'un cercle
        beginShape();
        vertex(this.pos.x - this.r, this.pos.y);
        vertex(this.pos.x + this.r, this.pos.y);
        vertex(this.pos.x, this.pos.y - this.r * 2);
        endShape(CLOSE);
      }
    }
  
    // Méthode pour dessiner le chemin avec des étoiles
// Méthode pour dessiner le chemin avec des étoiles
drawPath() {
  // Sauvegarde de l'état graphique actuel
  push();

  // Couleur du contour en blanc
  stroke(255);
  // Pas de remplissage pour la forme
  noFill();
  // Épaisseur du trait
  strokeWeight(1);

  // Remplissage de la forme avec la couleur définie pour le chemin
  fill(this.color);

  // Dessin du chemin avec des étoiles
  this.path.forEach((p, index) => {
    // Dessine une étoile à chaque 5ème point du chemin
    if (!(index % 5)) {
      beginShape();
      for (let i = 0; i < 5; i++) {
        let angle = TWO_PI * i / 5 - HALF_PI;
        let x = p.x + cos(angle) * 4.5; // Ajustez la taille de l'étoile selon vos préférences
        let y = p.y + sin(angle) * 4.5; // Ajustez la taille de l'étoile selon vos préférences
        vertex(x, y);
      }
      endShape(CLOSE);
    }
  });
  // Restauration de l'état graphique précédent
  pop();
}

    // Méthode pour dessiner un vecteur
drawVector(pos, v, color) {
  // Sauvegarde de l'état graphique actuel
  push();

  // Dessin du vecteur vitesse
  // Il part du centre du véhicule et va dans la direction du vecteur vitesse
  strokeWeight(3);
  stroke(color);
  line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);

  // Dessine un petit carré au bout du vecteur vitesse
  let squareSize = 5;
  translate(pos.x + v.x, pos.y + v.y);
  rotate(v.heading());
  rectMode(CENTER);
  rect(0, 0, squareSize, squareSize);

  // Restauration de l'état graphique précédent
  pop();
}
// Méthode pour ajuster la position du véhicule aux bords de l'espace de travail
edges() {
  // Vérification si la position en x dépasse le bord droit
  if (this.pos.x > width + this.r) {
    // Réinitialisation de la position à l'opposé du bord gauche
    this.pos.x = -this.r;
  }
  // Vérification si la position en x dépasse le bord gauche
  else if (this.pos.x < -this.r) {
    // Réinitialisation de la position à l'opposé du bord droit
    this.pos.x = width + this.r;
  }

  // Vérification si la position en y dépasse le bord bas
  if (this.pos.y > height + this.r) {
    // Réinitialisation de la position au-dessus du bord haut
    this.pos.y = -this.r;
  }
  // Vérification si la position en y dépasse le bord haut
  else if (this.pos.y < -this.r) {
    // Réinitialisation de la position en-dessous du bord bas
    this.pos.y = height + this.r;
  }
}
avoidHead(leader, vehicles, f) {
  // Suivi du leader
  let followLeaderForce = this.seek(leader);
  followLeaderForce.mult(0.2);
  this.applyForce(followLeaderForce);

  // Séparation avec les autres véhicules
  let separationForce = this.separation(vehicles);
  separationForce.mult(0.3);
  this.applyForce(separationForce);

  // Évasion si devant le leader
  let ahead = this.pos.copy();
  ahead.add(p5.Vector.mult(this.vel.copy().normalize(), 25));
  let threat = p5.Vector.sub(leader.pos, this.pos);
  let distanceToLeader = threat.mag();
  threat.normalize();
  let dotProduct = threat.dot(this.vel);

  // Éviter le leader si devant
  if (dotProduct > 0 && dotProduct < distanceToLeader / 2 && distanceToLeader < 100) {
    let evadeForce = this.seek(ahead, false); // Éviter en se dirigeant vers l'avant
    evadeForce.mult(0.5);
    this.applyForce(evadeForce);
  }

  // Cercle devant le leader (fuite du centre du cercle)
  let circleCenter = leader.pos.copy();
  let fleeCircleForce = this.flee(circleCenter, 100); // 100 est le rayon du cercle
  fleeCircleForce.mult(f);
  this.applyForce(fleeCircleForce);
}

}

  class Ennemy {
    constructor(x, y, couleur) {
      this.pos = createVector(x, y);
      this.vel = createVector(6, 3);
      this.acc = createVector(4, 2);
      this.maxSpeed = 4;
      this.maxForce = 0.2;
      this.r = 16;
      this.couleur = couleur;
  
  
      // pour comportement wander
      this.wanderTheta = PI / 2;
      this.displaceRange = 0.3;
      this.pathMaxLength = 50;
  
      this.path = [];
    }
  
    wander() {
      // point devant le véhicule
      let wanderPoint = this.vel.copy();
      wanderPoint.setMag(100);
      wanderPoint.add(this.pos);
  
  
      // Cercle autour du point
      let wanderRadius = 100;
      let theta = this.wanderTheta + this.vel.heading();
  
      let x = wanderRadius * cos(theta);
      let y = wanderRadius * sin(theta);
  
      // maintenant wanderPoint c'est un point sur le cercle
      wanderPoint.add(x, y);
  
       // On a donc la vitesse désirée que l'on cherche qui est le vecteur
       // allant du vaisseau au cercle vert. On le calcule :
       // ci-dessous, steer c'est la desiredSpeed directement !
      let steer = wanderPoint.sub(this.pos);
  
      steer.setMag(this.maxForce);
      this.applyForce(steer);
  
      // On déplace le point sur le cerlcle (en radians)
      this.displaceRange = 0.3;
      this.wanderTheta += random(-this.displaceRange, this.displaceRange);
    }
  
    evade(vehicle) {
      let pursuit = this.pursue(vehicle);
      pursuit.mult(-1);
      return pursuit;
    }
  
    /* 
  Méthode pour poursuivre un véhicule en prédisant sa position future.
  Elle renvoie la force à appliquer au véhicule actuel pour le faire se diriger vers la position prédite du véhicule cible.
*/
pursue(vehicle) {
  // Création d'une copie de la position du véhicule cible
  let target = vehicle.pos.copy();
  
  // Prédiction de la position future du véhicule cible en fonction de sa vitesse actuelle
  let prediction = vehicle.vel.copy();
  prediction.mult(10); // Multiplication par un facteur pour anticiper la position future
  target.add(prediction);

  // Dessin d'une étoile à la position prédite du véhicule cible (à des fins de visualisation)
  fill(255, 215, 0); // Couleur de l'étoile (jaune doré)
  drawStar(target.x, target.y, 8, 16, 5); // Appel à la fonction drawStar avec les paramètres appropriés
  
  // Renvoie la force à appliquer pour se diriger vers la position prédite du véhicule cible
  return this.seek(target);
}

/* 
  Fonction pour dessiner une étoile avec le nombre de point, le rayon externe, et le rayon interne spécifiés.
*/
 drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
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

  
    arrive(target) {
      // 2nd argument true enables the arrival behavior
      return this.seek(target, true);
    }
  
    flee(target) {
      return this.seek(target).mult(-1);
    }
  
    seek(target, arrival = false) {
      let force = p5.Vector.sub(target, this.pos);
      let desiredSpeed = this.maxSpeed;
      if (arrival) {
        let slowRadius = 100;
        let distance = force.mag();
        if (distance < slowRadius) {
          desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
        }
      }
      force.setMag(desiredSpeed);
      force.sub(this.vel);
      force.limit(this.maxForce);
      return force;
    }
  
    applyForce(force) {
      this.acc.add(force);
    }
  
    update() {
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.set(0, 0);
  
      // on rajoute la position courante dans le tableau
      this.path.push(this.pos.copy());
  
      // si le tableau a plus de 50 éléments, on vire le plus ancien
      if(this.path.length > this.pathMaxLength) {
        this.path.shift();
      }
    }


    show() {
  // Dessin du chemin parcouru par le fantôme
  this.path.forEach((p, index) => {
    if (!(index % 12)) {
      stroke(173, 216, 230); // Couleur des contours du chemin (bleu clair)
      //fill(100, 0, 255); // Couleur des ellipses du chemin (couleur fantôme)
      ellipse(p.x, p.y, 5, 5); // Ellipse représentant une position du chemin
    }
  });

  // Dessin du corps du fantôme (triangle)
  stroke(230, 173, 216); // Couleur des contours du corps du fantôme (bleu clair)
  strokeWeight(5); // Épaisseur des contours du corps du fantôme
  fill(230, 173, 216); // Couleur du corps du fantôme (couleur fantôme)
  push();
  translate(this.pos.x, this.pos.y); // Translation à la position actuelle du fantôme
  rotate(this.vel.heading()); // Rotation selon la direction de la vitesse du fantôme
  beginShape();
  vertex(0, -20); // Sommet du triangle
  vertex(-10, 0); // Coin inférieur gauche du triangle
  vertex(10, 0); // Coin inférieur droit du triangle
  endShape(CLOSE);
  noStroke(); // Pas de contours pour les yeux
  fill(173, 216, 230); // Couleur des yeux (bleu clair)
  ellipse(-5, -10, 5, 5); // Œil gauche
  ellipse(5, -10, 5, 5); // Œil droit
  pop(); // Restauration de l'état graphique précédent
}

  
    edges() {
      if (this.pos.x > width + this.r) {
        this.pos.x = -this.r;
      } else if (this.pos.x < -this.r) {
        this.pos.x = width + this.r;
      }
      if (this.pos.y > height + this.r) {
        this.pos.y = -this.r;
      } else if (this.pos.y < -this.r) {
        this.pos.y = height + this.r;
      }
    }
  }
  
  
 class Target extends Vehicle {
    constructor(x, y) {
      super(x, y);
      this.vel = p5.Vector.random3D();
      this.vel.mult(5);
    }
  
  }
  

    // Add this class for bullets at the beginning of your sketch.js file
  class Bullet extends Vehicle {
    constructor(x, y, target) {
      super(x, y);
      this.maxSpeed = 10; // Adjust the speed of bullets as needed
      this.target = target;
    }

    update() {
      // Override the update method to make bullets seek the target
      let seekForce = this.seek(this.target.pos);
      this.applyForce(seekForce);
      super.update();
    }

      // Method to check for collision with an enemy
    // Méthode pour vérifier si la cible touche un ennemi
hitEnemy(enemy) {
  // Calcul de la distance entre la cible et l'ennemi
  let distance = this.pos.dist(enemy.pos);
  // Retourne true si la distance est inférieure au rayon de l'ennemi, sinon false
  return distance < enemy.r;
}

// Méthode pour afficher la cible
show() {
  push(); // Sauvegarde du contexte graphique
  stroke(144, 238, 144); // Couleur des contours
  strokeWeight(7); // Épaisseur des contours
  push(); // Nouvelle sauvegarde du contexte graphique
  translate(this.pos.x, this.pos.y); // Translation à la position de la cible
  rect(0, 0, 2, 2); 
  pop(); // Restauration du contexte graphique précédent

  pop(); // Restauration du contexte graphique initial
}
  }
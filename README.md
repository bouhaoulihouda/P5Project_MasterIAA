Projet de Systèmes Multi-Agents avec p5.js

Suivi de Leader/Serpant


***Comportement d'Évitement d'Obstacles
Tous les véhicules, sont programmés pour éviter les obstacles présents dans l'environnement.


***Comportement Wander
Les véhicules peuvent également avoir un comportement de dérive aléatoire (wander), ajoutant une composante d'exploration à leur mouvement.


***Tir sur Ennemi (Optionnel)
Si vous cliquez boutton 'e', un ennemi apparaît à la position du curseur. Tous les véhicules s'arrêtent et tirent sur l'ennemi lorseque vous cliquez sur le boutton 'k'. Une fois l'ennemi atteint, les balles (mini-véhicules) sont supprimées, et les véhicules reprennent leurs comportements normaux.


***Contrôles
Appuyez sur la touche "s" pour basculer entre les modes (leader/serpent).
Appuyez sur la touche "d" pour Debug mode.
Cliquez avec la souris pour faire apparaître un obstacle.
Appuyez sur la touche "e" pour faire apparaître un ennemi.
Appuyez sur la touche "k" pour déclencher le tir des véhicules.
Si la touche "h" est pressée, un nouveau véhicule est créé qui va suivre le point ou le cercle rouge
Si la touche "m" est pressée, dix missiles (Vehicle) sont créés ils vont suivre le leader ou serpent
****Score


Le système de score a été intégré pour renforcer l'aspect interactif du programme. Chaque fois qu'un ennemi est éliminé, le score augmente, ajoutant ainsi une dimension de compétition ou de progression. Cette fonctionnalité a été suggérée par un ami, qui a apporté une contribution significative à l'évolution du projet en introduisant l'idée de suivre les performances du joueur à travers un score.


***
La fonction avoidHead a été implémentée avec l'objectif de prévenir les véhicules de se positionner devant le leader, déclenchant ainsi un comportement d'évasion lorsqu'ils se trouvent dans la zone frontale du leader. Cependant, des problèmes ont été identifiés dans son fonctionnement initial. Dans le cadre des efforts d'amélioration continue, des ajustements sont en cours pour résoudre ces problèmes et optimiser le comportement d'évasion.


*****
En tant qu'amélioration significative du projet, une attention particulière a été portée à l'expérience utilisateur en intégrant un menu interactif. Ce menu offre une interface conviviale permettant aux utilisateurs de choisir différentes fonctionnalités du projet en cliquant sur des boutons spécifiques.



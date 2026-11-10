export type Q = {
  q: string;
  options: string[];
  answer: number;
  explain: string;
};

export const QUESTIONS: Q[] = [
  {
    q: "Quelle instruction est absolument indispensable pour que les callbacks d'un Node rclpy (timers, souscriptions) soient traités par l'executor ?",
    options: [
      "node.start_listening()",
      "rclpy.spin(node)",
      "rclpy.run_forever()",
      "node.process_events()"
    ],
    answer: 1,
    explain: "rclpy.spin(node) bloque le thread d'exécution pour écouter la file d'attente d'événements du middleware DDS et appeler vos callbacks associés dès l'arrivée d'un message ou le tic d'un timer."
  },
  {
    q: "Quel type de construction (<build_type>) doit être impérativement spécifié dans package.xml pour un package ROS 2 purement Python ?",
    options: [
      "ament_cmake",
      "catkin_python",
      "ament_python",
      "colcon_py"
    ],
    answer: 2,
    explain: "Pour les packages Python, la balise <build_type> de package.xml doit valoir 'ament_python'. 'ament_cmake' est quant à lui réservé aux packages C++."
  },
  {
    q: "Pourquoi est-il fortement recommandé d'utiliser l'option '--symlink-install' lors de l'exécution de 'colcon build' en développement Python ?",
    options: [
      "Elle optimise le bytecode Python pour rendre l'exécution 2 fois plus rapide",
      "Elle génère des liens symboliques vers les fichiers sources .py, évitant de recompiler après chaque modification de code",
      "Elle installe automatiquement les dépendances apt manquantes",
      "Elle active le mode multi-threading expérimental de ROS 2"
    ],
    answer: 1,
    explain: "Avec --symlink-install, les fichiers installés dans install/ sont des pointeurs directs vers vos fichiers .py du dossier src/. Toute sauvegarde dans votre éditeur est immédiatement effective sans relancer colcon !"
  },
  {
    q: "Après avoir compilé avec succès un workspace via colcon, vous ouvrez un nouveau terminal et lancez 'ros2 run mon_pkg mon_node', mais obtenez 'Package not found'. Quelle est la cause ?",
    options: [
      "Le code Python comporte une erreur de syntaxe",
      "Le terminal n'a pas sourcé le workspace via 'source install/setup.bash'",
      "Le démon DDS a planté",
      "L'utilisateur n'a pas les droits sudo"
    ],
    answer: 1,
    explain: "Chaque nouveau terminal doit impérativement sourcer l'overlay ('source ~/ros2_ws/install/setup.bash') pour renseigner la variable d'environnement AMENT_PREFIX_PATH."
  },
  {
    q: "Que représente le troisième argument '10' dans l'appel 'self.create_publisher(Float32, '/topic', 10)' ?",
    options: [
      "La fréquence d'émission maximale autorisée (10 Hz)",
      "Le nombre maximal de Subscribers autorisés à se connecter",
      "La profondeur de la file d'attente QoS (History Depth) en cas d'engorgement",
      "Le délai d'attente (timeout) en secondes"
    ],
    answer: 2,
    explain: "Ce nombre fixe la taille du tampon QoS (KEEP_LAST). Si les messages arrivent plus vite qu'ils ne sont transmis, seuls les 10 plus récents sont conservés."
  },
  {
    q: "Pour programmer un timer à une fréquence de publication exacte de 10 Hz, quelle durée de période en secondes faut-il passer à 'self.create_timer(period, callback)' ?",
    options: [
      "10.0 secondes",
      "1.0 seconde",
      "0.01 seconde",
      "0.10 seconde"
    ],
    answer: 3,
    explain: "La période est l'inverse de la fréquence : T = 1 / f = 1 / 10 = 0.10 seconde."
  },
  {
    q: "Un Node publie des messages de type 'std_msgs/msg/Float64' sur un topic. Un autre Node tente de souscrire au même topic avec 'std_msgs/msg/Float32'. Que se passe-t-il ?",
    options: [
      "ROS 2 convertit automatiquement les valeurs sans perte de précision",
      "Les deux nodes ne peuvent pas communiquer et ROS 2 signale un conflit d'incompatibilité de type",
      "Le subscriber reçoit uniquement la valeur par défaut 0.0",
      "Le système d'exploitation arrête les deux processus"
    ],
    answer: 1,
    explain: "Les topics ROS 2 sont strictement typés. Comme sur une fréquence radio émettant en modulation différente, aucun message n'est reçu si les types ne concordent pas rigoureusement."
  },
  {
    q: "Quelle commande de la CLI ROS 2 permet de lister instantanément tous les topics actifs tout en affichant leurs types de données respectifs ?",
    options: [
      "ros2 topic list -t",
      "ros2 topic types --all",
      "ros2 node info -topics",
      "ros2 interface list"
    ],
    answer: 0,
    explain: "L'option -t (pour --show-types) adjoint le type officiel entre crochets à côté de chaque nom de topic : ex: /telemetry/lidar_raw [std_msgs/msg/Float32]."
  },
  {
    q: "Pourquoi est-il proscrit d'exécuter un traitement long et bloquant (comme 'time.sleep(3)') à l'intérieur d'une fonction callback d'un Subscriber ?",
    options: [
      "Le compilateur Python refuse d'exécuter time.sleep dans une classe",
      "L'executor par défaut étant mono-thread, cela bloque l'ensemble des autres callbacks et timers du node pendant 3 secondes",
      "Le topic est immédiatement détruit sur le réseau DDS",
      "La mémoire vive du robot est saturée"
    ],
    answer: 1,
    explain: "Dans un SingleThreadedExecutor rclpy, tous les callbacks partagent le même fil d'exécution séquentiel. Un callback bloquant fige instantanément tout le node."
  },
  {
    q: "Quelle fonction à syntaxe obligatoire doit être présente dans tout fichier launch ROS 2 écrit en Python (*.launch.py) ?",
    options: [
      "def run_ros2_launch()",
      "def main(args=None)",
      "def generate_launch_description()",
      "def init_launch_nodes()"
    ],
    answer: 2,
    explain: "La commande 'ros2 launch' inspecte le fichier Python et invoque précisément 'generate_launch_description()', qui doit retourner un objet 'LaunchDescription'."
  },
];

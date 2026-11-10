export type Block =
  | { t: "h"; text: string }
  | { t: "p"; text: string }
  | { t: "list"; items: string[] }
  | { t: "callout"; kind: "tip" | "warn" | "best" | "analogy"; title: string; text: string }
  | { t: "diagram"; lines: string };

export type CodeFile = { name: string; lang: "python" | "xml" | "bash"; code: string; notes?: { line: number; text: string }[] };
export type Cmd = { cmd: string; desc: string; flags?: { f: string; d: string }[] };
export type Pitfall = { title: string; symptom: string; fix: string };

export type Module = {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  theory: Block[];
  code: CodeFile[];
  commands: Cmd[];
  pitfalls: Pitfall[];
};

const SETUP_PY = `from setuptools import setup

package_name = 'pipeline_pkg'

setup(
    name=package_name,
    version='0.1.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
        ('share/' + package_name + '/launch', ['launch/pipeline.launch.py']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='student',
    maintainer_email='student@ros2.academy',
    description='Pipeline de sécurité 3 nodes',
    license='Apache-2.0',
    entry_points={
        'console_scripts': [
            'raw_telemetry = pipeline_pkg.raw_telemetry_node:main',
            'safety_filter = pipeline_pkg.distance_filter_node:main',
            'emergency_brake = pipeline_pkg.emergency_brake_node:main',
        ],
    },
)`;

const PACKAGE_XML = `<?xml version="1.0"?>
<package format="3">
  <name>pipeline_pkg</name>
  <version>0.1.0</version>
  <description>Pipeline de sécurité 3 nodes</description>
  <maintainer email="student@ros2.academy">student</maintainer>
  <license>Apache-2.0</license>

  <exec_depend>rclpy</exec_depend>
  <exec_depend>std_msgs</exec_depend>
  <exec_depend>launch_ros</exec_depend>

  <export>
    <build_type>ament_python</build_type>
  </export>
</package>`;

const SOURCE_PITFALL: Pitfall = {
  title: "Oublier de sourcer install/setup.bash",
  symptom: "Package 'pipeline_pkg' not found",
  fix: "Après chaque colcon build, dans chaque nouveau terminal : source ~/ros2_ws/install/setup.bash",
};

export const MODULES: Module[] = [
  {
    id: "intro",
    tag: "00",
    title: "Introduction à ROS 2",
    subtitle: "Concepts fondamentaux & analogie radio",
    theory: [
      { t: "p", text: "ROS 2 (Robot Operating System 2) n'est pas un système d'exploitation classique : c'est un middleware, une armature logicielle distribuée permettant à des processus indépendants (les Nodes) de coopérer sur un même robot ou à travers un réseau local grâce au protocole DDS (Data Distribution Service)." },
      { t: "h", text: "Les 4 briques fondamentales" },
      { t: "list", items: [
        "Node : un processus autonome dédié à une tâche robotique précise (acquisition capteur, filtrage, planification, asservissement moteur).",
        "Topic : un bus de données unidirectionnel, nommé et strictement typé (ex : /telemetry/lidar_raw) sur lequel transitent les flux d'informations.",
        "Message : structure de données standardisée et typée (ex : std_msgs/msg/Float32, sensor_msgs/msg/LaserScan).",
        "Publisher & Subscriber : modèle de communication découplé. L'émetteur publie sans connaître ses auditeurs ; les abonnés écoutent sans bloquer l'émetteur.",
        "Graph de calcul : la cartographie vivante des nodes et de leurs flux d'échanges, visualisable via l'outil rqt_graph.",
      ]},
      { t: "callout", kind: "analogy", title: "L'analogie de la Radio FM", text: "Un Topic est une fréquence radio FM (ex: 104.2 MHz). Le Publisher est la station émettrice : elle diffuse son signal en continu sans savoir qui allume son autoradio. Les Subscribers sont les auditeurs branchés sur cette fréquence. Si personne n'écoute, la radio diffuse tout de même. Si un auditeur veut écouter de la musique en AM sur un récepteur FM (type de message différent), la communication échoue !" },
      { t: "diagram", lines: `  [ Publisher Node ]                      [ Subscriber Node A ]
  /raw_telemetry_node ──► /telemetry/lidar_raw ──►  /distance_filter_node
                          (std_msgs/Float32)   └─►  [ Subscriber Node B ]
                                                    /dashboard_gui_node` },
      { t: "callout", kind: "tip", title: "ROS 2 Humble Hawksbill (LTS)", text: "ROS 2 Humble est la version LTS de référence industrielle supportée sur Ubuntu 22.04 LTS (Jammy Jellyfish) jusqu'en mai 2027." },
      { t: "callout", kind: "best", title: "Règle d'or de conception", text: "Un Node = Une responsabilité. Évitez les nodes mammouths : la modularité permet d'isoler les pannes et de réutiliser vos briques sur n'importe quel robot." },
    ],
    code: [
      { name: "hello_ros.py", lang: "python", code: `import rclpy
from rclpy.node import Node


def main():
    rclpy.init()                       # 1. Initialise le middleware ROS 2
    node = Node('hello_node')          # 2. Instancie un node nommé
    node.get_logger().info('Bienvenue sur ROS 2 Humble Hawksbill !')
    node.destroy_node()                # 3. Libère proprement les ressources
    rclpy.shutdown()                   # 4. Clôture le contexte DDS


if __name__ == '__main__':
    main()`, notes: [
        { line: 1, text: "rclpy : ROS Client Library for Python." },
        { line: 5, text: "rclpy.init() initialise le runtime DDS et les threads sous-jacents." },
        { line: 7, text: "get_logger() injecte horodatage, nom du node et niveau (INFO, WARN...)." },
      ]},
    ],
    commands: [
      { cmd: "source /opt/ros/humble/setup.bash", desc: "Charge l'underlay ROS 2 Humble dans l'environnement du terminal." },
      { cmd: "echo 'source /opt/ros/humble/setup.bash' >> ~/.bashrc", desc: "Automatise le chargement de ROS 2 à chaque ouverture de terminal." },
      { cmd: "ros2 run demo_nodes_cpp talker", desc: "Démarre un publisher C++ officiel de démonstration diffusant sur /chatter." },
      { cmd: "ros2 run demo_nodes_py listener", desc: "Dans un second terminal : démarre un subscriber Python qui lit le node C++ (interopérabilité multi-langage)." },
    ],
    pitfalls: [
      { title: "Réflexe hérité de ROS 1 (roscore inexistant)", symptom: "Commande roscore ou rosrun introuvable", fix: "En ROS 2, il n'y a plus de roscore maître central. La découverte entre nodes est décentralisée via DDS (Discovery multicast)." },
      { title: "Isolation par ROS_DOMAIN_ID", symptom: "Deux terminaux ou machines sur le même WiFi ne se captent pas", fix: "Vérifiez que la variable d'environnement 'export ROS_DOMAIN_ID=0' (ou même entier 0-101) est identique sur tous vos shells." },
    ],
  },
  {
    id: "lab01",
    tag: "LAB 01",
    title: "Workspace & Package",
    subtitle: "~/ros2_ws, ament_python, colcon build",
    theory: [
      { t: "p", text: "Le workspace (espace de travail) est la racine où vivent vos projets. L'outil officiel 'colcon' compile les packages présents dans src/ et assemble les répertoires build/, install/ et log/." },
      { t: "diagram", lines: `~/ros2_ws/
├── src/                                  ← Seul dossier où vous écrivez du code
│   └── pipeline_pkg/
│       ├── package.xml                   ← Carte d'identité et dépendances (format 3)
│       ├── setup.py                      ← Points d'entrée exécutables console_scripts
│       ├── setup.cfg                     ← Configuration d'installation lib
│       ├── resource/pipeline_pkg         ← Marqueur ament_index
│       └── pipeline_pkg/                 ← Code source Python du package
│           ├── __init__.py
│           ├── raw_telemetry_node.py
│           ├── distance_filter_node.py
│           └── emergency_brake_node.py
├── build/                                ← Fichiers temporaires de compilation
├── install/                              ← Fichiers exécutables finaux (à sourcer !)
└── log/                                  ← Journaux d'exécution de colcon` },
      { t: "callout", kind: "tip", title: "Underlay vs Overlay", text: "/opt/ros/humble est l'underlay (fourni par le système). Votre dossier ~/ros2_ws/install est l'overlay : il prend le pas sur l'underlay et permet d'ajouter vos propres nodes." },
      { t: "callout", kind: "warn", title: "Erreur fréquente", text: "Ne lancez JAMAIS colcon build depuis l'intérieur du dossier src/ ! Exécutez-le toujours depuis la racine du workspace : ~/ros2_ws." },
    ],
    code: [
      { name: "package.xml", lang: "xml", code: PACKAGE_XML, notes: [
        { line: 9, text: "exec_depend : déclare rclpy, std_msgs et launch_ros comme indispensables." },
        { line: 14, text: "build_type 'ament_python' indique un package pur Python sans compilation C++." },
      ]},
      { name: "setup.py", lang: "python", code: SETUP_PY, notes: [
        { line: 11, text: "data_files : enregistre le package dans l'ament index et copie le dossier launch." },
        { line: 23, text: "console_scripts : associe la commande CLI 'ros2 run' au main() du script Python." },
      ]},
    ],
    commands: [
      { cmd: "mkdir -p ~/ros2_ws/src && cd ~/ros2_ws/src", desc: "Crée l'arborescence standard du workspace ROS 2.", flags: [{ f: "-p", d: "Crée les répertoires parents sans erreur s'ils existent déjà" }] },
      { cmd: "ros2 pkg create --build-type ament_python --dependencies rclpy std_msgs pipeline_pkg", desc: "Génère automatiquement la structure standard d'un package Python avec ses manifestes.", flags: [
        { f: "--build-type ament_python", d: "Sélectionne le gestionnaire Python ament" },
        { f: "--dependencies", d: "Pré-remplit les balises depend dans package.xml" },
      ]},
      { cmd: "cd ~/ros2_ws && colcon build --symlink-install", desc: "Compile l'ensemble des packages du workspace avec liens symboliques.", flags: [
        { f: "--symlink-install", d: "Crée des liens vers vos .py : évite de recompiler à chaque retouche de code !" },
        { f: "--packages-select pipeline_pkg", d: "Optionnel : accélère la compilation en ciblant un seul package" },
      ]},
      { cmd: "source install/setup.bash", desc: "Active l'overlay local dans le terminal actif pour exposer les nouveaux exécutables." },
    ],
    pitfalls: [
      SOURCE_PITFALL,
      { title: "Compilation déclenchée dans src/", symptom: "Les dossiers build/ et install/ se créent à l'intérieur de src/", fix: "Supprimez-les (rm -rf build install), remontez d'un cran (cd ~/ros2_ws) et relancez colcon build." },
      { title: "Oubli du drapeau --symlink-install", symptom: "Mes modifications dans mon script .py n'apparaissent pas à l'exécution de ros2 run", fix: "Ajoutez impérativement --symlink-install à colcon build pour pointer directement vers vos scripts sources." },
    ],
  },
  {
    id: "lab02",
    tag: "LAB 02",
    title: "Premier Node rclpy",
    subtitle: "Classe héritant de Node, constructeur, logger et rclpy.spin()",
    theory: [
      { t: "p", text: "En ROS 2 rclpy moderne, tout Node est une classe héritant de 'rclpy.node.Node'. Le constructeur initialise les objets ROS (publishers, subscribers, timers), et rclpy.spin() maintient le node éveillé pour traiter sa file d'attente d'événements." },
      { t: "diagram", lines: `[ rclpy.init(args) ]
         │
         ▼
[ Instanciation MyFirstNode() ]
         ├── super().__init__('my_first_node')
         ├── self.create_timer(1.0, self.timer_callback)
         │
         ▼
[ rclpy.spin(node) ]  ◄── Boucle d'événements bloquante (écoute & exécute les callbacks)
         │
         ▼ (Interruption Ctrl+C)
[ node.destroy_node() ] ──► [ rclpy.shutdown() ]` },
      { t: "callout", kind: "warn", title: "Le piège absolu du débutant : spin()", text: "Sans l'appel à rclpy.spin(node), votre script Python exécute le constructeur en 3 millisecondes et quitte immédiatement sans jamais exécuter le moindre callback de timer ou de réception !" },
      { t: "callout", kind: "best", title: "Bonne pratique : super().__init__", text: "La toute première ligne de votre constructeur __init__ doit être super().__init__('nom_unique_du_node')." },
    ],
    code: [
      { name: "my_first_node.py", lang: "python", code: `import rclpy
from rclpy.node import Node


class MyFirstNode(Node):
    """Exemple canonique d'un Node ROS 2 orienté objet en Python."""

    def __init__(self):
        super().__init__('my_first_node')
        self.counter_ = 0
        # Timer à 1 Hz (période = 1.0 seconde)
        self.timer_ = self.create_timer(1.0, self.timer_callback)
        self.get_logger().info('MyFirstNode a été initialisé avec succès !')

    def timer_callback(self):
        self.counter_ += 1
        self.get_logger().info(f'Battement de cœur # {self.counter_}')


def main(args=None):
    rclpy.init(args=args)
    node = MyFirstNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Arrêt demandé par l\\'utilisateur (Ctrl+C).')
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()`, notes: [
        { line: 5, text: "Héritage obligatoire de rclpy.node.Node." },
        { line: 9, text: "Déclaration du nom officiel du node dans le graphe ROS 2." },
        { line: 12, text: "create_timer associe une fréquence à une méthode de rappel (callback)." },
        { line: 23, text: "spin(node) monopolise le thread principal pour traiter les événements entrants." },
      ]},
    ],
    commands: [
      { cmd: "colcon build --packages-select pipeline_pkg --symlink-install", desc: "Compile le package contenant le premier node." },
      { cmd: "source install/setup.bash", desc: "Actualise le chemin des exécutables du workspace." },
      { cmd: "ros2 run pipeline_pkg my_first_node", desc: "Exécute le node dans le terminal actif.", flags: [
        { f: "--ros-args -r __node:=robot_heartbeat", d: "Permet de surcharger le nom du node à l'exécution sans toucher au code" },
      ]},
    ],
    pitfalls: [
      { title: "Le programme démarre et se ferme en 1 seconde", symptom: "Aucun log n'apparaît, retour immédiat au prompt bash", fix: "Vous avez omis d'appeler 'rclpy.spin(node)' dans la fonction main()." },
      { title: "Entry point non déclaré dans setup.py", symptom: "No executable found / Package 'pipeline_pkg' doesn't contain executable", fix: "Ajoutez 'my_first_node = pipeline_pkg.my_first_node:main' dans setup.py sous console_scripts et recompilez." },
      { title: "Oubli de super().__init__", symptom: "AttributeError: 'MyFirstNode' object has no attribute '_Node__handle'", fix: "Appelez toujours super().__init__('nom_node') avant d'invoquer create_timer ou create_publisher." },
    ],
  },
  {
    id: "lab03",
    tag: "LAB 03",
    title: "Publisher et Timer",
    subtitle: "create_publisher, message Float32, émission périodique 10Hz",
    theory: [
      { t: "p", text: "Un Publisher diffuse des messages structurés sur un Topic. En robotique, on combine un Publisher avec un Timer pour émettre des données capteurs à une fréquence temporelle stable (ex: 10 Hz = 0.1 s)." },
      { t: "callout", kind: "analogy", title: "L'émetteur et la file d'attente (QoS)", text: "create_publisher(Float32, '/telemetry/lidar_raw', 10) configure une antenne qui émet des paquets Float32. Le chiffre 10 représente la profondeur de la mémoire tampon (History Depth) : si le réseau DDS ralentit, les 10 messages les plus récents sont conservés avant d'écraser les anciens." },
      { t: "diagram", lines: `Horloge Système (Timer à 10 Hz, Période = 0.1 s)
                     │
                     ▼
          timer_callback() déclenché
                     │
                     ├─► msg = Float32()
                     ├─► msg.data = valeur_distance
                     └─► self.publisher_.publish(msg)
                                 │
                                 ▼
                     Topic : /telemetry/lidar_raw` },
      { t: "callout", kind: "tip", title: "Formule de conversion Période ↔ Fréquence", text: "Période en secondes = 1.0 / Fréquence en Hertz. Pour 10 Hz → Période = 1 / 10 = 0.1 seconde. Pour 50 Hz → 0.02 seconde." },
    ],
    code: [
      { name: "raw_telemetry_node.py", lang: "python", code: `import random
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32


class RawTelemetryNode(Node):
    """Simule un capteur télémétrique LiDAR qui publie à 10 Hz."""

    def __init__(self):
        super().__init__('raw_telemetry_node')
        # Création du publisher sur le topic /telemetry/lidar_raw
        self.publisher_ = self.create_publisher(
            Float32,
            '/telemetry/lidar_raw',
            10
        )
        # Timer à 10 Hz (période 0.10 s)
        self.timer_ = self.create_timer(0.10, self.timer_callback)
        self.nominal_distance_ = 2.50
        self.get_logger().info('Capteur LiDAR démarré sur /telemetry/lidar_raw @ 10Hz')

    def timer_callback(self):
        msg = Float32()
        # Bruit gaussien léger (± 4 cm)
        noise = random.gauss(0.0, 0.04)
        # 5% de probabilité d'une mesure aberrante (glitch capteur)
        if random.random() < 0.05:
            noise += random.choice([-1.80, 2.20])
        msg.data = float(max(0.05, self.nominal_distance_ + noise))
        self.publisher_.publish(msg)
        self.get_logger().debug(f'Distance brute émise : {msg.data:.3f} m')


def main(args=None):
    rclpy.init(args=args)
    node = RawTelemetryNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()`, notes: [
        { line: 4, text: "Import du type officiel std_msgs/msg/Float32." },
        { line: 13, text: "Type de message, nom du topic, profondeur de file QoS." },
        { line: 19, text: "0.10 seconde correspond précisément à 10 Hz." },
        { line: 29, text: "Injection d'aberrations pour tester notre futur filtre." },
        { line: 31, text: "L'appel à publish(msg) est asynchrone et non-bloquant." },
      ]},
    ],
    commands: [
      { cmd: "ros2 run pipeline_pkg raw_telemetry", desc: "Démarre le node d'émission de télémétrie." },
      { cmd: "ros2 topic echo /telemetry/lidar_raw", desc: "Affiche en direct dans le terminal les messages circulant sur le topic." },
      { cmd: "ros2 topic hz /telemetry/lidar_raw", desc: "Calcule et affiche la fréquence réelle de publication (doit stabiliser à ~10.0 Hz)." },
      { cmd: "ros2 topic pub --once /telemetry/lidar_raw std_msgs/msg/Float32 '{data: 0.35}'", desc: "Publie manuellement un message isolé pour tester le système.", flags: [
        { f: "--once", d: "Émet un unique message puis rend la main" },
        { f: "-r 10", d: "Publie en continu à un taux fixé (ex: 10 Hz)" },
      ]},
    ],
    pitfalls: [
      { title: "Erreur d'assignation du type primitif", symptom: "AssertionError: The 'data' field must be of type 'float'", fix: "Le champ .data d'un Float32 attend un float Python strict. Utilisez toujours msg.data = float(valeur) si vous manipulez des entiers ou des chaînes." },
      { title: "Utilisation d'une boucle while True + time.sleep", symptom: "CPU à 100%, impossibilité d'interrompre proprement, blocage des autres composants", fix: "N'écrivez jamais de boucle 'while True' bloquante dans un node ROS 2 ! Utilisez systématiquement 'self.create_timer()'." },
    ],
  },
  {
    id: "lab04",
    tag: "LAB 04",
    title: "Subscriber et Callbacks",
    subtitle: "create_subscription, fonction de rappel non-bloquante, filtrage",
    theory: [
      { t: "p", text: "Un Subscriber s'abonne à un Topic existant et déclenche une fonction spécifique (le callback) chaque fois qu'un nouveau message arrive sur le bus. Ce mécanisme est entièrement réactif et événementiel (event-driven)." },
      { t: "callout", kind: "warn", title: "Règle critique : un callback ne doit JAMAIS bloquer !", text: "Par défaut, rclpy utilise un 'SingleThreadedExecutor'. Cela signifie que tant qu'un callback est en cours d'exécution (par exemple avec un time.sleep(3) ou un calcul lourd), TOUT LE RESTE DU NODE EST TOTALEMENT PARALYSÉ : aucun autre message n'est lu et aucun timer ne se déclenche !" },
      { t: "diagram", lines: `Topic : /telemetry/lidar_raw (Float32)
                     │
                     ▼
       self.create_subscription()
                     │
                     ▼ (Événement d'arrivée de message)
         listener_callback(msg: Float32)
                     │
                     ├─► 1. Vérification des bornes (0.05m <= distance <= 10.0m)
                     ├─► 2. Ajout dans une fenêtre glissante (deque de 5)
                     ├─► 3. Calcul de la médiane (élimination des outliers)
                     └─► 4. Publication sur /safety/obstacle_distance` },
      { t: "callout", kind: "best", title: "Conservez la référence de l'abonnement", text: "Assignez toujours votre souscription à un attribut d'instance (ex: self.subscription_ = self.create_subscription(...)) pour empêcher le Garbage Collector de Python de la détruire prématurément." },
    ],
    code: [
      { name: "distance_filter_node.py", lang: "python", code: `from collections import deque
from statistics import median
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32


class DistanceFilterNode(Node):
    """Filtre les données télémétriques brutes via une médiane glissante."""

    def __init__(self):
        super().__init__('distance_filter_node')
        # Historique glissant de taille 5
        self.window_ = deque(maxlen=5)

        # Souscription au flux de télémétrie brute
        self.sub_ = self.create_subscription(
            Float32,
            '/telemetry/lidar_raw',
            self.distance_callback,
            10
        )
        # Publication du flux de données nettoyées
        self.pub_ = self.create_publisher(
            Float32,
            '/safety/obstacle_distance',
            10
        )
        self.get_logger().info('Filtre de sécurité actif sur /safety/obstacle_distance')

    def distance_callback(self, msg: Float32):
        # 1. Rejet physique des lectures impossibles
        if msg.data < 0.05 or msg.data > 10.0:
            self.get_logger().warn(f'Mesure hors-limite rejetée : {msg.data:.2f} m')
            return

        # 2. Mise à jour de la mémoire tampon
        self.window_.append(msg.data)

        # 3. Calcul de la médiane pour éliminer les aberrations sporadiques
        filtered_value = float(median(self.window_))

        # 4. Publication immédiate de la valeur filtrée
        out_msg = Float32()
        out_msg.data = filtered_value
        self.pub_.publish(out_msg)


def main(args=None):
    rclpy.init(args=args)
    node = DistanceFilterNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()`, notes: [
        { line: 13, text: "deque(maxlen=5) conserve automatiquement les 5 dernières mesures." },
        { line: 16, text: "create_subscription relie le topic au callback self.distance_callback." },
        { line: 29, text: "Filtre passe-bande éliminant les lectures non physiques." },
        { line: 36, text: "La médiane rejette les sauts aberrants sans décaler la phase." },
      ]},
    ],
    commands: [
      { cmd: "ros2 run pipeline_pkg safety_filter", desc: "Démarre le node de filtrage (après avoir lancé le publisher)." },
      { cmd: "ros2 topic echo /safety/obstacle_distance", desc: "Affiche les données filtrées en temps réel (constatez la disparition des pics anormaux)." },
      { cmd: "ros2 topic info /safety/obstacle_distance -v", desc: "Vérifie les publishers, subscribers et leurs profils QoS respectifs.", flags: [
        { f: "-v", d: "Mode verbeux : détaille la politique QoS (Reliability, Durability)" },
      ]},
    ],
    pitfalls: [
      { title: "Incompatibilité de type de message", symptom: "Le subscriber ne reçoit jamais aucun message ou erreur 'topic has more than one type'", fix: "Le Publisher et le Subscriber doivent utiliser EXACTEMENT le même type de message (Float32 ≠ Float64). Vérifiez avec 'ros2 topic list -t'." },
      { title: "Callback bloquant avec calcul lourd ou sleep", symptom: "Latence grandissante, avertissements QoS dropped messages", fix: "Déléguez les calculs lourds à un thread séparé ou utilisez un MultiThreadedExecutor de rclpy." },
    ],
  },
  {
    id: "lab05",
    tag: "LAB 05",
    title: "Introspection CLI & rqt_graph",
    subtitle: "Boîte à outils de débuggage en direct : ros2 cli, interfaces et graphe",
    theory: [
      { t: "p", text: "La suite de commandes 'ros2' constitue votre stéthoscope de diagnostic. Elle permet d'inspecter, écouter, mesurer et stimuler n'importe quel node ou topic sans avoir à modifier une seule ligne de code." },
      { t: "h", text: "Les commandes maîtresses d'introspection" },
      { t: "list", items: [
        "ros2 node list : dresse l'inventaire de tous les nodes découverts sur le sous-réseau.",
        "ros2 node info <nom> : affiche la carte d'identité d'un node (publishers, subscribers, services et actions).",
        "ros2 topic list -t : liste tous les topics actifs avec leur type de message associé entre crochets.",
        "ros2 topic echo <nom> : écoute et affiche les flux de messages en temps réel dans le terminal.",
        "ros2 topic hz <nom> : mesure précisément la fréquence d'échantillonnage réelle du topic.",
        "ros2 interface show <type> : affiche la définition brute des champs d'un type de message (ex: std_msgs/msg/Float32).",
        "rqt_graph : ouvre l'outil graphique interactif représentant nodes (ellipses) et topics (rectangles).",
      ]},
      { t: "callout", kind: "tip", title: "Testez directement dans le simulateur !", text: "La console interactive située dans la colonne de droite exécute l'ensemble de ces commandes en temps réel avec un formatage authentique ROS 2 Humble !" },
    ],
    code: [
      { name: "introspection_cheat_sheet.sh", lang: "bash", code: `#!/usr/bin/env bash
# Inspection globale du système ROS 2
echo "=== NODES ACTIFS ==="
ros2 node list

echo "=== TOPICS ET LEURS TYPES ==="
ros2 topic list -t

echo "=== DÉTAILS DU FILTRE DE SÉCURITÉ ==="
ros2 node info /distance_filter_node

echo "=== FRÉQUENCE DU RADAR LIDAR ==="
ros2 topic hz /telemetry/lidar_raw

echo "=== STRUCTURE DU MESSAGE BOOLÉEN ==="
ros2 interface show std_msgs/msg/Bool

# Lancement du visualiseur graphique
rqt_graph &`, notes: [
        { line: 4, text: "Liste les nodes en cours d'exécution." },
        { line: 7, text: "Le drapeau -t est crucial pour repérer les conflits de types." },
        { line: 16, text: "rqt_graph utilise Graphviz/Qt pour modéliser le graphe DDS." },
      ]},
    ],
    commands: [
      { cmd: "ros2 node list", desc: "Affiche la liste complète des nodes actifs." },
      { cmd: "ros2 node info /emergency_brake_node", desc: "Détaille les abonnements, publications et services du frein d'urgence." },
      { cmd: "ros2 topic list -t", desc: "Liste tous les topics avec leur signature de type.", flags: [{ f: "-t", d: "Affiche le type de message associé" }] },
      { cmd: "ros2 topic hz /telemetry/lidar_raw", desc: "Mesure la fréquence moyenne, minimale et maximale du topic." },
      { cmd: "ros2 topic echo /safety/obstacle_distance", desc: "Écoute en direct les données émises sur ce topic." },
      { cmd: "rqt_graph", desc: "Lance l'interface graphique de visualisation du graphe de communication." },
    ],
    pitfalls: [
      { title: "rqt_graph affiche une vue vide", symptom: "Aucun node ni topic n'apparaît dans la fenêtre rqt_graph", fix: "Cliquez sur l'icône de rafraîchissement (flèche bleue circulaire) et vérifiez que les cases 'Dead sinks' et 'Leaf topics' ne masquent pas vos nodes." },
      { title: "Terminal qui ne trouve pas la commande ros2", symptom: "ros2: command not found", fix: "Votre terminal n'a pas sourcé ROS 2 : exécutez 'source /opt/ros/humble/setup.bash'." },
    ],
  },
  {
    id: "lab06",
    tag: "LAB 06",
    title: "Launch Files",
    subtitle: "Orchestration multi-nodes en Python avec LaunchDescription",
    theory: [
      { t: "p", text: "Sur un robot réel, lancer 15 terminaux à la main est impensable. Un Launch File Python (.launch.py) orchestre le démarrage ordonné de l'ensemble de vos nodes, la configuration de leurs paramètres et la redirection éventuelle de leurs topics (remapping) en une seule ligne de commande !" },
      { t: "callout", kind: "best", title: "Structure conventionnelle d'un launch file", text: "Le fichier doit définir une fonction nommée impérativement 'generate_launch_description()' qui retourne un objet 'LaunchDescription' contenant une liste d'actions (Node, DeclareLaunchArgument, IncludeLaunchDescription)." },
      { t: "callout", kind: "tip", title: "Le mécanisme de Remapping", text: "remappings=[('/ancien_nom', '/nouveau_nom')] permet de brancher un node pré-existant sur un autre topic sans jamais toucher à son code source !" },
    ],
    code: [
      { name: "launch/pipeline.launch.py", lang: "python", code: `from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    """Point d'entrée obligatoire appelé par la commande 'ros2 launch'."""
    return LaunchDescription([
        # 1. Node d'acquisition brute
        Node(
            package='pipeline_pkg',
            executable='raw_telemetry',
            name='raw_telemetry_node',
            output='screen',
        ),
        # 2. Node de filtrage médian
        Node(
            package='pipeline_pkg',
            executable='safety_filter',
            name='distance_filter_node',
            output='screen',
        ),
        # 3. Node de décision et freinage d'urgence
        Node(
            package='pipeline_pkg',
            executable='emergency_brake',
            name='emergency_brake_node',
            parameters=[{'threshold': 0.50}],
            output='screen',
        ),
    ])`, notes: [
        { line: 5, text: "Fonction conventionnelle appelée par l'exécuteur de launch." },
        { line: 9, text: "package : nom du package ROS 2 (pipeline_pkg)." },
        { line: 10, text: "executable : nom de la console_script déclarée dans setup.py." },
        { line: 12, text: "output='screen' redirige les logs du node vers le terminal parent." },
        { line: 26, text: "Injection du paramètre de seuil de déclenchement (0.50 m)." },
      ]},
    ],
    commands: [
      { cmd: "colcon build --symlink-install && source install/setup.bash", desc: "Recompile pour synchroniser le nouveau dossier launch/ dans install/." },
      { cmd: "ros2 launch pipeline_pkg pipeline.launch.py", desc: "Démarre instantanément les 3 nodes du pipeline en parallèle." },
      { cmd: "ros2 launch pipeline_pkg pipeline.launch.py --show-args", desc: "Inspecte les arguments configurables exposés par le launch file." },
    ],
    pitfalls: [
      { title: "Launch file non trouvé par ros2 launch", symptom: "file 'pipeline.launch.py' was not found in the share directory of package 'pipeline_pkg'", fix: "Vous avez oublié de déclarer le dossier launch dans 'data_files' de votre setup.py : ('share/' + package_name + '/launch', ['launch/pipeline.launch.py']). Recompilez avec colcon !" },
      { title: "Import launch_ros manquant", symptom: "ModuleNotFoundError: No module named 'launch_ros'", fix: "Ajoutez la dépendance <exec_depend>launch_ros</exec_depend> dans package.xml." },
    ],
  },
  {
    id: "projet01",
    tag: "PROJET 01",
    title: "Pipeline 3 Nodes",
    subtitle: "Télémétrie brute (Float32) → Filtre (<0.50m) → Arrêt d'urgence (Bool)",
    theory: [
      { t: "p", text: "Mise en pratique intégrale : vous concevez le système de sécurité anticollision d'un robot autonome. Les 3 nodes collaborent pour analyser l'environnement et déclencher un arrêt d'urgence dès qu'un obstacle pénètre la zone de danger critique (< 0.50 m)." },
      { t: "diagram", lines: `[ /raw_telemetry_node ]  (Émetteur LiDAR brut à 10 Hz)
            │
            ▼ Topic : /telemetry/lidar_raw [std_msgs/Float32]
[ /distance_filter_node ] (Filtre médian glissant anti-bruit)
            │
            ▼ Topic : /safety/obstacle_distance [std_msgs/Float32]
[ /emergency_brake_node ] (Surveillance de seuil critique < 0.50m)
            │
            ▼ Topic : /vehicle/brake_cmd [std_msgs/Bool]` },
      { t: "list", items: [
        "Node 1 (/raw_telemetry_node) : lit le capteur physique et diffuse la distance avec son bruit naturel.",
        "Node 2 (/distance_filter_node) : absorbe les données bruitées, rejette les anomalies et publie la distance lissée.",
        "Node 3 (/emergency_brake_node) : compare la distance filtrée au seuil critique et publie un ordre d'arrêt franc (True/False).",
      ]},
      { t: "callout", kind: "warn", title: "Pourquoi ne jamais brancher le frein directement sur le capteur brut ?", text: "Si le frein écoutait directement /telemetry/lidar_raw, un seul rayon laser égaré ou une réflexion poussière produisant un faux positif (ex: 0.12 m pendant 10ms) provoquerait un freinage fantôme violent du robot. Le filtrage intermédiaire garantit la sûreté de fonctionnement." },
    ],
    code: [
      { name: "emergency_brake_node.py", lang: "python", code: `import rclpy
from rclpy.node import Node
from std_msgs.msg import Bool, Float32


class EmergencyBrakeNode(Node):
    """Surveille la distance sécuritaire et commande le frein d'urgence."""

    def __init__(self):
        super().__init__('emergency_brake_node')
        # Déclaration d'un paramètre ROS 2 dynamique (par défaut 0.50 m)
        self.declare_parameter('threshold', 0.50)

        # Abonnement au topic filtré
        self.sub_ = self.create_subscription(
            Float32,
            '/safety/obstacle_distance',
            self.distance_callback,
            10
        )
        # Publication de la commande d'actionneur de frein
        self.pub_ = self.create_publisher(
            Bool,
            '/vehicle/brake_cmd',
            10
        )
        self.get_logger().info('Node Frein d\\'urgence armé (Seuil = 0.50 m)')

    def distance_callback(self, msg: Float32):
        threshold = self.get_parameter('threshold').get_parameter_value().double_value
        brake_cmd = Bool()

        # Déclenchement si obstacle sous le seuil
        if msg.data < threshold:
            brake_cmd.data = True
            self.get_logger().warn(
                f'ALERTE COLLISION : obstacle détecté à {msg.data:.2f} m (< {threshold:.2f}m) ! FREINAGE ACTIF'
            )
        else:
            brake_cmd.data = False

        self.pub_.publish(brake_cmd)


def main(args=None):
    rclpy.init(args=args)
    node = EmergencyBrakeNode()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()`, notes: [
        { line: 11, text: "declare_parameter rend le seuil modifiable à chaud sans recompiler." },
        { line: 16, text: "Abonnement branché sur le topic filtré sécurisé." },
        { line: 29, text: "Lecture dynamique du paramètre ROS 2." },
        { line: 34, text: "Log de niveau WARN visible en couleur dans les terminaux d'exploitation." },
      ]},
      { name: "setup.py", lang: "python", code: SETUP_PY },
      { name: "package.xml", lang: "xml", code: PACKAGE_XML },
    ],
    commands: [
      { cmd: "cd ~/ros2_ws && colcon build --symlink-install", desc: "Compile l'ensemble du projet avec les 3 nodes." },
      { cmd: "source install/setup.bash", desc: "Charge les exécutables créés dans l'environnement." },
      { cmd: "ros2 launch pipeline_pkg pipeline.launch.py", desc: "Lance la chaîne de sécurité complète en une commande." },
      { cmd: "ros2 topic echo /vehicle/brake_cmd", desc: "Observe l'état du frein dans un terminal dédié." },
      { cmd: "ros2 param set /emergency_brake_node threshold 0.80", desc: "Ajuste dynamiquement la distance de sécurité à 0.80 m pendant l'exécution !" },
    ],
    pitfalls: [
      SOURCE_PITFALL,
      { title: "Freinage fantôme dû à un mauvais câblage de topic", symptom: "Le frein se déclenche de manière intempestive", fix: "Vérifiez dans rqt_graph que /emergency_brake_node est bien abonné à /safety/obstacle_distance et NON PAS directement à /telemetry/lidar_raw." },
      { title: "Erreur de format de message sur /vehicle/brake_cmd", symptom: "Impossible de lire la commande de frein", fix: "Vérifiez avec 'ros2 topic list -t' que le topic est typé 'std_msgs/msg/Bool' et non Float32." },
    ],
  },
];

export const QUIZ_ID = "quiz";

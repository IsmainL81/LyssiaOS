class RobotService {

    connected=false

    connect(){

        console.log("Connexion au robot...")

    }

    disconnect(){

        console.log("Robot déconnecté")

    }

}

export default new RobotService()
export default function Card({title,children}){

    return(

        <div
        style={{

            background:"#151C2F",

            borderRadius:"18px",

            padding:"20px",

            color:"white",

            boxShadow:"0 0 15px rgba(0,0,0,.4)",

            marginBottom:"20px"

        }}
        >

            <h3>{title}</h3>

            <hr/>

            {children}

        </div>

    )

}
const imageInput =
document.getElementById("imageInput");

const preview =
document.getElementById("preview");

imageInput.addEventListener(
"change",
function(){

    const file =
    imageInput.files[0];

    if(file){

        preview.src =
        URL.createObjectURL(file);

    }

});

async function predictDisease(){

    let file =
    imageInput.files[0];

    if(!file){

        alert(
            "Please select an image"
        );

        return;
    }

    let formData =
    new FormData();

    formData.append(
        "file",
        file
    );

    let response =
    await fetch(
        "/predict",
        {
            method:"POST",
            body:formData
        }
    );

    let data =
    await response.json();

    document.getElementById(
        "result"
    ).innerHTML =

    `
    <h2>Disease:
    ${data.disease}</h2>

    <h3>Confidence:
    ${data.confidence}%</h3>

    <h3>Health Score:
    ${data.health_score}/100</h3>
    `;
}
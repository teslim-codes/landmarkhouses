document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("applicationForm");

    const canvas = document.getElementById("signaturePad");

    const clearSignature =
        document.getElementById("clearSignature");

    const ctx = canvas.getContext("2d");

    let drawing = false;
    let hasSignature = false;


    /* ==========================================
       SIGNATURE CANVAS
    ========================================== */

    function setupCanvas() {

        const oldImage =
            hasSignature
                ? canvas.toDataURL("image/png")
                : null;

        const rect =
            canvas.getBoundingClientRect();

        const ratio =
            Math.max(window.devicePixelRatio || 1, 1);

        canvas.width =
            rect.width * ratio;

        canvas.height =
            rect.height * ratio;

        ctx.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );

        ctx.lineWidth = 1.7;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#7181a6";

        if (oldImage) {

            const image = new Image();

            image.onload = () => {

                ctx.drawImage(
                    image,
                    0,
                    0,
                    rect.width,
                    rect.height
                );

            };

            image.src = oldImage;
        }
    }


    setupCanvas();


    window.addEventListener("resize", setupCanvas);


    /* ==========================================
       GET POINTER POSITION
    ========================================== */

    function getPosition(event) {

        const rect =
            canvas.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }


    /* ==========================================
       START DRAWING
    ========================================== */

    function startDrawing(event) {

        event.preventDefault();

        drawing = true;
        hasSignature = true;

        const position =
            getPosition(event);

        ctx.beginPath();

        ctx.moveTo(
            position.x,
            position.y
        );
    }


    /* ==========================================
       DRAW
    ========================================== */

    function draw(event) {

        if (!drawing) {
            return;
        }

        event.preventDefault();

        const position =
            getPosition(event);

        ctx.lineTo(
            position.x,
            position.y
        );

        ctx.stroke();
    }


    /* ==========================================
       STOP DRAWING
    ========================================== */

    function stopDrawing(event) {

        if (event) {
            event.preventDefault();
        }

        drawing = false;

        ctx.closePath();
    }


    /* ==========================================
       MOUSE EVENTS
    ========================================== */

    canvas.addEventListener(
        "mousedown",
        startDrawing
    );

    canvas.addEventListener(
        "mousemove",
        draw
    );

    canvas.addEventListener(
        "mouseup",
        stopDrawing
    );

    canvas.addEventListener(
        "mouseleave",
        stopDrawing
    );


    /* ==========================================
       TOUCH EVENTS
    ========================================== */

    canvas.addEventListener(
        "touchstart",
        (event) => {

            event.preventDefault();

            const touch =
                event.touches[0];

            startDrawing({
                preventDefault: () =>
                    event.preventDefault(),

                clientX: touch.clientX,
                clientY: touch.clientY
            });

        },
        { passive: false }
    );


    canvas.addEventListener(
        "touchmove",
        (event) => {

            if (!drawing) {
                return;
            }

            event.preventDefault();

            const touch =
                event.touches[0];

            draw({
                preventDefault: () =>
                    event.preventDefault(),

                clientX: touch.clientX,
                clientY: touch.clientY
            });

        },
        { passive: false }
    );


    canvas.addEventListener(
        "touchend",
        stopDrawing,
        { passive: false }
    );


    /* ==========================================
       CLEAR SIGNATURE
    ========================================== */

    clearSignature.addEventListener(
        "click",
        () => {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            hasSignature = false;

        }
    );


    /* ==========================================
       PHONE NUMBER FORMAT
    ========================================== */

    const phone =
        document.getElementById("phone");

    phone.addEventListener(
        "input",
        () => {

            let value =
                phone.value.replace(/\D/g, "");

            if (value.length > 10) {
                value = value.substring(0, 10);
            }

            if (value.length >= 7) {

                phone.value =
                    `(${value.substring(0, 3)}) ` +
                    `${value.substring(3, 6)}-` +
                    `${value.substring(6)}`;

            } else if (value.length >= 4) {

                phone.value =
                    `(${value.substring(0, 3)}) ` +
                    value.substring(3);

            } else if (value.length > 0) {

                phone.value =
                    `(${value}`;

            }

        }
    );


    /* ==========================================
       PREVENT NEGATIVE NUMBERS
    ========================================== */

    const numberInputs =
        document.querySelectorAll(
            'input[type="number"]'
        );

    numberInputs.forEach(input => {

        input.addEventListener(
            "input",
            () => {

                if (Number(input.value) < 0) {
                    input.value = 0;
                }

            }
        );

    });


    /* ==========================================
       DATE VALIDATION
    ========================================== */

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    const dob =
        document.getElementById("dob");

    const viewingDate =
        document.getElementById("viewingDate");

    const moveInDate =
        document.getElementById("moveInDate");


    /* DOB cannot be future */

    dob.max = today;


    /* Viewing date cannot be before today */

    viewingDate.min = today;


    /* Move-in date cannot be before today */

    moveInDate.min = today;


    /* ==========================================
       MOVE-IN DATE VALIDATION
    ========================================== */

    moveInDate.addEventListener(
        "change",
        () => {

            if (
                viewingDate.value &&
                moveInDate.value <
                viewingDate.value
            ) {

                alert(
                    "Target move-in date cannot be earlier than the viewing date."
                );

                moveInDate.value = "";
            }

        }
    );


    /* ==========================================
       FORM SUBMISSION
    ========================================== */

    form.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            /* Browser validation */

            if (!form.checkValidity()) {

                form.reportValidity();

                return;
            }


            /* Signature validation */

            if (!hasSignature) {

                alert(
                    "Please provide your signature before submitting the application."
                );

                return;
            }


            /* Collect form */

            const formData =
                new FormData(form);


            const application =
                {};

            formData.forEach(
                (value, key) => {

                    application[key] =
                        value;

                }
            );


            /* Save signature */

            application.signature =
                canvas.toDataURL(
                    "image/png"
                );


            console.log(
                "Application:",
                application
            );


            /*
                SEND TO BACKEND HERE

                Example:

                fetch("submit.php", {
                    method: "POST",
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                });
            */


            alert(
                "Your application has been submitted successfully."
            );

        }
    );

});
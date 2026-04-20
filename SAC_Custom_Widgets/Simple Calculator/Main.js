(function () {
  let template = document.createElement("template");
  template.innerHTML = `<style>
.calculator {
  padding: 20px;
  -webkit-box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
  border-radius: 1px;
}

.input {
  border: 1px solid #ddd;
  border-radius: 1px;
  height: 60px;
  padding-right: 15px;
  padding-top: 10px;
  text-align: right;
  margin-right: 6px;
  font-size: 2.5rem;
  overflow-x: auto;
  transition: all .2s ease-in-out;
}

.input:hover {
  border: 1px solid #bbb;
  -webkit-box-shadow: inset 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
  box-shadow: inset 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
}

.buttons {}

.operators {}

.operators div {
  display: inline-block;
  border: 1px solid #bbb;
  border-radius: 1px;
  width: 80px;
  text-align: center;
  padding: 10px;
  margin: 20px 4px 10px 0;
  cursor: pointer;
  background-color: #ddd;
  transition: border-color .2s ease-in-out, background-color .2s, box-shadow .2s;
}

.operators div:hover {
  background-color: #ddd;
  -webkit-box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
  border-color: #aaa;
}

.operators div:active {
  font-weight: bold;
}

.leftPanel {
  display: inline-block;
}

.numbers div {
  display: inline-block;
  border: 1px solid #ddd;
  border-radius: 1px;
  width: 80px;
  text-align: center;
  padding: 10px;
  margin: 10px 4px 10px 0;
  cursor: pointer;
  background-color: #f9f9f9;
  transition: border-color .2s ease-in-out, background-color .2s, box-shadow .2s;
}

.numbers div:hover {
  background-color: #f1f1f1;
  -webkit-box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
  border-color: #bbb;
}

.numbers div:active {
  font-weight: bold;
}

div.equal {
  display: inline-block;
  border: 1px solid #3079ED;
  border-radius: 1px;
  width: 17%;
  text-align: center;
  padding: 127px 10px;
  margin: 10px 6px 10px 0;
  vertical-align: top;
  cursor: pointer;
  color: #FFF;
  background-color: #4d90fe;
  transition: all .2s ease-in-out;
}

div.equal:hover {
  background-color: #307CF9;
  -webkit-box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
  border-color: #1857BB;
}

div.equal:active {
  font-weight: bold;
}
  </style><div class="main-container">
  <div class="calculator">
  <div class="input" id="input"></div>
  <div class="buttons">
    <div class="operators">
      <div>+</div>
      <div>-</div>
      <div>&times;</div>
      <div>&divide;</div>
    </div>
    <div class="leftPanel">
      <div class="numbers">
        <div>7</div>
        <div>8</div>
        <div>9</div>
      </div>
      <div class="numbers">
        <div>4</div>
        <div>5</div>
        <div>6</div>
      </div>
      <div class="numbers">
        <div>1</div>
        <div>2</div>
        <div>3</div>
      </div>
      <div class="numbers">
        <div>0</div>
        <div>.</div>
        <div id="clear">C</div>
      </div>
    </div>
    <div class="equal" id="result">=</div>
  </div>
</div>
  </div>`;
  class Calculator extends HTMLElement {
    constructor() {
      super();
      let shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.appendChild(template.content.cloneNode(true));
      this._props = {};

      var input = shadowRoot.getElementById("input"), // input/output button
        number = shadowRoot.querySelectorAll(".numbers div"), // number buttons
        operator = shadowRoot.querySelectorAll(".operators div"), // operator buttons
        result = shadowRoot.getElementById("result"), // equal button
        clear = shadowRoot.getElementById("clear"), // clear button
        resultDisplayed = false; // flag to keep an eye on what output is displayed

      // adding click handlers to number buttons
      for (var i = 0; i < number.length; i++) {
        number[i].addEventListener("click", function (e) {
          // storing current input string and its last character in variables - used later
          var currentString = input.innerHTML;
          var lastChar = currentString[currentString.length - 1];

          // if result is not diplayed, just keep adding
          if (resultDisplayed === false) {
            input.innerHTML += e.target.innerHTML;
          } else if (
            (resultDisplayed === true && lastChar === "+") ||
            lastChar === "-" ||
            lastChar === "×" ||
            lastChar === "÷"
          ) {
            // if result is currently displayed and user pressed an operator
            // we need to keep on adding to the string for next operation
            resultDisplayed = false;
            input.innerHTML += e.target.innerHTML;
          } else {
            // if result is currently displayed and user pressed a number
            // we need clear the input string and add the new input to start the new opration
            resultDisplayed = false;
            input.innerHTML = "";
            input.innerHTML += e.target.innerHTML;
          }
        });
      }

      // adding click handlers to number buttons
      for (var i = 0; i < operator.length; i++) {
        operator[i].addEventListener("click", function (e) {
          // storing current input string and its last character in variables - used later
          var currentString = input.innerHTML;
          var lastChar = currentString[currentString.length - 1];

          // if last character entered is an operator, replace it with the currently pressed one
          if (
            lastChar === "+" ||
            lastChar === "-" ||
            lastChar === "×" ||
            lastChar === "÷"
          ) {
            var newString =
              currentString.substring(0, currentString.length - 1) +
              e.target.innerHTML;
            input.innerHTML = newString;
          } else if (currentString.length == 0) {
            // if first key pressed is an opearator, don't do anything
            console.log("enter a number first");
          } else {
            // else just add the operator pressed to the input
            input.innerHTML += e.target.innerHTML;
          }
        });
      }

      // on click of 'equal' button
      result.addEventListener("click", function () {
        // this is the string that we will be processing eg. -10+26+33-56*34/23
        var inputString = input.innerHTML;

        // forming an array of numbers. eg for above string it will be: numbers = ["10", "26", "33", "56", "34", "23"]
        var numbers = inputString.split(/\+|\-|\×|\÷/g);

        // forming an array of operators. for above string it will be: operators = ["+", "+", "-", "*", "/"]
        // first we replace all the numbers and dot with empty string and then split
        var operators = inputString.replace(/[0-9]|\./g, "").split("");

        var divide = operators.indexOf("÷");
        while (divide != -1) {
          numbers.splice(divide, 2, numbers[divide] / numbers[divide + 1]);
          operators.splice(divide, 1);
          divide = operators.indexOf("÷");
        }

        var multiply = operators.indexOf("×");
        while (multiply != -1) {
          numbers.splice(
            multiply,
            2,
            numbers[multiply] * numbers[multiply + 1]
          );
          operators.splice(multiply, 1);
          multiply = operators.indexOf("×");
        }

        var subtract = operators.indexOf("-");
        while (subtract != -1) {
          numbers.splice(
            subtract,
            2,
            numbers[subtract] - numbers[subtract + 1]
          );
          operators.splice(subtract, 1);
          subtract = operators.indexOf("-");
        }

        var add = operators.indexOf("+");
        while (add != -1) {
          // using parseFloat is necessary, otherwise it will result in string concatenation :)
          numbers.splice(
            add,
            2,
            parseFloat(numbers[add]) + parseFloat(numbers[add + 1])
          );
          operators.splice(add, 1);
          add = operators.indexOf("+");
        }

        input.innerHTML = numbers[0]; // displaying the output

        resultDisplayed = true; // turning flag if result is displayed
      });

      // clearing the input on press of clear
      clear.addEventListener("click", function () {
        input.innerHTML = "";
      });
    }

    connectedCallback() {}

    onCustomWidgetBeforeUpdate(changedProperties) {
      this._props = { ...this._props, ...changedProperties };
    }

    onCustomWidgetAfterUpdate(changedProperties) {}

    //more functions needed
  }
  customElements.define("com-rohitchouhan-sap-simple-calculator", Calculator);
})();

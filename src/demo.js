class SampleClass {
  constructor(name) {
    this.name = name;
  }

  dump() {
    console.log("Hello world", this.name);
  }
}

(new SampleClass("midi lib")).dump();

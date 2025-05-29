import { WaAPI } from "./WaAPI.node";

test("smoke", () => {
    const node = new WaAPI()
    expect(node.description.properties).toBeDefined()
})

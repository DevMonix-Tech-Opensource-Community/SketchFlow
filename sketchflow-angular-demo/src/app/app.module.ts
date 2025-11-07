import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { GeneratedComponent } from "./generated/LandingScreen";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, GeneratedComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}

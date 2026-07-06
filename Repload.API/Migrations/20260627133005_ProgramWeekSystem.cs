using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repload.API.Migrations
{
    /// <inheritdoc />
    public partial class ProgramWeekSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Workouts_Programs_ProgramsId",
                table: "Workouts");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSets_Exercises_ExerciseId",
                table: "WorkoutSets");

            migrationBuilder.DropIndex(
                name: "IX_Workouts_ProgramsId",
                table: "Workouts");

            migrationBuilder.DropColumn(
                name: "ProgramsId",
                table: "Workouts");

            migrationBuilder.AddColumn<int>(
                name: "ProgramWorkoutId",
                table: "WorkoutSets",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProgramWeeks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProgramId = table.Column<int>(type: "int", nullable: false),
                    WeekNumber = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgramWeeks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProgramWeeks_Programs_ProgramId",
                        column: x => x.ProgramId,
                        principalTable: "Programs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProgramWorkouts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProgramWeekId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgramWorkouts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProgramWorkouts_ProgramWeeks_ProgramWeekId",
                        column: x => x.ProgramWeekId,
                        principalTable: "ProgramWeeks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutSets_ProgramWorkoutId",
                table: "WorkoutSets",
                column: "ProgramWorkoutId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramWeeks_ProgramId",
                table: "ProgramWeeks",
                column: "ProgramId");

            migrationBuilder.CreateIndex(
                name: "IX_ProgramWorkouts_ProgramWeekId",
                table: "ProgramWorkouts",
                column: "ProgramWeekId");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSets_Exercises_ExerciseId",
                table: "WorkoutSets",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSets_ProgramWorkouts_ProgramWorkoutId",
                table: "WorkoutSets",
                column: "ProgramWorkoutId",
                principalTable: "ProgramWorkouts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSets_Exercises_ExerciseId",
                table: "WorkoutSets");

            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSets_ProgramWorkouts_ProgramWorkoutId",
                table: "WorkoutSets");

            migrationBuilder.DropTable(
                name: "ProgramWorkouts");

            migrationBuilder.DropTable(
                name: "ProgramWeeks");

            migrationBuilder.DropIndex(
                name: "IX_WorkoutSets_ProgramWorkoutId",
                table: "WorkoutSets");

            migrationBuilder.DropColumn(
                name: "ProgramWorkoutId",
                table: "WorkoutSets");

            migrationBuilder.AddColumn<int>(
                name: "ProgramsId",
                table: "Workouts",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Workouts_ProgramsId",
                table: "Workouts",
                column: "ProgramsId");

            migrationBuilder.AddForeignKey(
                name: "FK_Workouts_Programs_ProgramsId",
                table: "Workouts",
                column: "ProgramsId",
                principalTable: "Programs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutSets_Exercises_ExerciseId",
                table: "WorkoutSets",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

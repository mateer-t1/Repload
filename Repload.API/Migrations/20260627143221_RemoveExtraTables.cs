using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repload.API.Migrations
{
    /// <inheritdoc />
    public partial class RemoveExtraTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutSets_ProgramWorkouts_ProgramWorkoutId",
                table: "WorkoutSets");

            migrationBuilder.DropTable(
                name: "ProgramWorkouts");

            migrationBuilder.DropTable(
                name: "ProgramWeeks");

            migrationBuilder.DropTable(
                name: "Programs");

            migrationBuilder.DropIndex(
                name: "IX_WorkoutSets_ProgramWorkoutId",
                table: "WorkoutSets");

            migrationBuilder.DropColumn(
                name: "ProgramWorkoutId",
                table: "WorkoutSets");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProgramWorkoutId",
                table: "WorkoutSets",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Programs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phase = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Weeks = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Programs", x => x.Id);
                });

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
                    DayIndex = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
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
                name: "FK_WorkoutSets_ProgramWorkouts_ProgramWorkoutId",
                table: "WorkoutSets",
                column: "ProgramWorkoutId",
                principalTable: "ProgramWorkouts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
